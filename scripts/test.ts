import { ethers, upgrades } from "hardhat";
import { ERC20__factory, Vault__factory, IAaveV3__factory, InterestRateStrategy__factory } from "../typechain";
import fs from "fs";
import { BigNumber } from "ethers";


const RAY = BigNumber.from(10).pow(27);
const HALF_RAY = RAY.div(2);
const PERCENTAGE_FACTOR = BigNumber.from(10).pow(4);
const HALF_PERCENTAGE_FACTOR = PERCENTAGE_FACTOR.div(2);

function rayDiv(a: BigNumber, b: BigNumber) {
    return a.mul(RAY).add(b.div(2)).div(b);
}


function rayMul(a: BigNumber, b: BigNumber) {
    return a.mul(b).add(HALF_RAY).div(RAY);
}


function percentMul(value: BigNumber, percentage: BigNumber) {
    return value.mul(percentage).add(HALF_PERCENTAGE_FACTOR).div(PERCENTAGE_FACTOR);
}

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[2];
    const data = fs.readFileSync("./config/deployed.json", "utf-8");
    const parsed = JSON.parse(data);
    const vault = Vault__factory.connect(parsed.vault, wallet);
    const aaveV3 = IAaveV3__factory.connect((await vault.aaveV3Addresses(0)), wallet);
    let reserveDataExtend = await aaveV3.getReserveDataExtended(parsed.token);

    const aaveDataProviderAbi = [
        "function getReserveCaps(address asset) external view returns (uint256 borrowCap, uint256 supplyCap)",
        `function getReserveData(address asset) external view override returns (
            uint256 unbacked,
            uint256 accruedToTreasuryScaled,
            uint256 totalAToken,
            uint256 totalStableDebt,
            uint256 totalVariableDebt,
            uint256 liquidityRate,
            uint256 variableBorrowRate,
            uint256 stableBorrowRate,
            uint256 averageStableBorrowRate,
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint40 lastUpdateTimestamp
        )`,
        `function getReserveConfigurationData(address asset) external view returns (
            uint256 decimals,
            uint256 ltv,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 reserveFactor,
            bool usageAsCollateralEnabled,
            bool borrowingEnabled,
            bool stableBorrowRateEnabled,
            bool isActive,
            bool isFrozen
        )`,
    ]

    const aaveDataProvider = new ethers.Contract("0x41393e5e337606dc3821075Af65AeE84D7688CBD", aaveDataProviderAbi, wallet);
    // const caps = await aaveDataProvider.getReserveData(parsed.token);
    // console.log(caps);

    // const aave = IAaveV3__factory.connect("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", wallet);
    // const res = await aave.getReserveData(parsed.token);
    // console.log(res);
    const config = await aaveDataProvider.getReserveConfigurationData(parsed.token);
    const reserveData2 = await aaveDataProvider.getReserveData(parsed.token);

    // const interestRateStrategy = new ethers.Contract("0x9ec6F08190DeA04A54f8Afc53Db96134e5E3FdFB", InteresrateStrategyRateAbi, wallet);
    const interestRateStrategy = InterestRateStrategy__factory.connect("0x9ec6F08190DeA04A54f8Afc53Db96134e5E3FdFB", wallet);
    console.log(reserveDataExtend.virtualUnderlyingBalance);
    const params = {
        unbacked: reserveData2.unbacked,
        liquidityAdded: 7000_000_000_000,
        liquidityTaken: 0,
        totalDebt: reserveData2.totalStableDebt.add(reserveData2.totalVariableDebt),
        reserveFactor: config.reserveFactor,
        reserve: parsed.token,
        usingVirtualBalance: true,
        virtualUnderlyingBalance: reserveDataExtend.virtualUnderlyingBalance
    }
    const res = await interestRateStrategy.calculateInterestRates(params);
    console.log(res);

    const rayInterestRateData = await interestRateStrategy.getInterestRateData(parsed.token);
    // const rayInterestRateData = _bfsToRay(interestRateData);

    // struct CalcInterestRatesLocalVars {
    //     uint256 availableLiquidity;
    //     uint256 currentVariableBorrowRate;
    //     uint256 currentLiquidityRate;
    //     uint256 borrowUsageRatio;
    //     uint256 supplyUsageRatio;
    //     uint256 availableLiquidityPlusDebt;
    //   }
    const vars = {
        availableLiquidity: BigNumber.from(0),
        currentVariableBorrowRate: rayInterestRateData.baseVariableBorrowRate,
        currentLiquidityRate: BigNumber.from(0),
        borrowUsageRatio: BigNumber.from(0),
        supplyUsageRatio: BigNumber.from(0),
        availableLiquidityPlusDebt: BigNumber.from(0),
    }

    if (!params.usingVirtualBalance) {
        return [BigNumber.from(0), vars.currentLiquidityRate];
    }

    if (params.totalDebt.gt(0)) {
        vars.availableLiquidity = params.virtualUnderlyingBalance.add(params.liquidityAdded).sub(params.liquidityTaken);
        vars.availableLiquidityPlusDebt = vars.availableLiquidity.add(params.totalDebt);
        vars.borrowUsageRatio = rayDiv(params.totalDebt, vars.availableLiquidityPlusDebt);
        vars.supplyUsageRatio = rayDiv(params.totalDebt, vars.availableLiquidityPlusDebt.add(params.unbacked));
    }
    else {
        return [BigNumber.from(0), vars.currentLiquidityRate];
    }

    console.log(rayInterestRateData)

    if (vars.borrowUsageRatio.gt(rayInterestRateData.optimalUsageRatio)) {
        let excessBorrowUsageRatio = rayDiv(vars.borrowUsageRatio.sub(rayInterestRateData.optimalUsageRatio), RAY.sub(rayInterestRateData.optimalUsageRatio));
        vars.currentVariableBorrowRate = vars.currentVariableBorrowRate.add(rayInterestRateData.variableRateSlope1.add(rayMul(rayInterestRateData.variableRateSlope2, excessBorrowUsageRatio)));
        // vars.currentVariableBorrowRate = vars.currentVariableBorrowRate.add.rayDiv(rayMul(rayInterestRateData.variableRateSlope1, vars.borrowUsageRatio), rayInterestRateData.optimalUsageRatio);
    }
    else {
        vars.currentVariableBorrowRate = vars.currentVariableBorrowRate
            .add(rayDiv(rayMul(rayInterestRateData.variableRateSlope1, vars.borrowUsageRatio), rayInterestRateData.optimalUsageRatio));
    }

    vars.currentLiquidityRate = percentMul(
        rayMul(vars.currentVariableBorrowRate, vars.supplyUsageRatio),
        PERCENTAGE_FACTOR.sub(config.reserveFactor)
    )

    console.log(vars.currentLiquidityRate);
    console.log(vars.currentVariableBorrowRate);

}


test().catch((error) => {
    console.error(error);
    process.exit(1);
});
