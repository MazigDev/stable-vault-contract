import { ethers, upgrades } from "hardhat";
import { NETWORK_CONFIG } from "./address";

const network = "ETHEREUM";
const CONFIG = NETWORK_CONFIG[network];
const { USDT, USDC, NATIVE } = CONFIG.TOKENS;
const { AAVE, COMPOUND } = CONFIG.LENDING_POOLS;

async function deployVaultFixture(
    network: string = "ETHEREUM"
) {
    const CONFIG = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG];
    const { USDT, USDC, NATIVE } = CONFIG.TOKENS;
    const { AAVE, COMPOUND, VENUS } = CONFIG.LENDING_POOLS;

    const usdtContract = await ethers.getContractAt("IERC20", USDT.address);
    const usdcContract = await ethers.getContractAt("IERC20", USDC.address);
    const nativeContract = await ethers.getContractAt("IERC20", NATIVE.address);

    const router = await ethers.getContractAt("IUniswapV2Router02", CONFIG.UNISWAP_V2_ROUTER);
    const [owner, admin, user1, user2, user3] = await ethers.getSigners();

    // Swap 7000ETH for USDT, USDC for user1, user2, user3
    const path_USDT = [NATIVE.address, USDT.address];
    const path_USDC = [NATIVE.address, USDC.address];
    for (let user of [ user1, user2, user3]) {
        await router.connect(user).swapExactETHForTokens(
            0, path_USDT, user.address,
            "1000000000000000000", 
            { 
                value: ethers.utils.parseEther("7"),
                maxFeePerGas: "20564098716" 
            }
        );
        await router.connect(user).swapExactETHForTokens(
            0, path_USDC, user.address,
            "1000000000000000000",
            { 
                value: ethers.utils.parseEther("7"),
                maxFeePerGas: "20564098716" 
            }
        );
    }

    const aaveV3Pool = await ethers.getContractAt("IAaveV3", AAVE.pool);
    const compoundV3UsdtPool = await ethers.getContractAt("ICompoundV3", COMPOUND.cUSDT);
    const compoundV3UsdcPool = await ethers.getContractAt("ICompoundV3", COMPOUND.cUSDC);

    const vaultFactory = await ethers.getContractFactory("Vault");
    const name = "MAZIG Vault";
    const symbol = "MAZIG";

    const vaultUSDTDeploy = await upgrades.deployProxy(
        vaultFactory,
        [name, symbol, admin.address, USDT.address, [AAVE.pool], [COMPOUND.cUSDT]],
        { initializer: "initialize" }
    );
    const usdtVault = await vaultUSDTDeploy.deployed();

    const vaultUSDCDeploy = await upgrades.deployProxy(
        vaultFactory,
        [name, symbol, admin.address, USDC.address, [AAVE.pool], [COMPOUND.cUSDC]],
        { initializer: "initialize" }
    );
    const usdcVault = await vaultUSDCDeploy.deployed();

    return {
        name,
        symbol,
        usdtVault,
        usdtContract,
        usdcVault,
        usdcContract,
        nativeContract,
        vaultFactory,
        router,
        aaveV3Pool,
        compoundV3UsdtPool,
        compoundV3UsdcPool,
        owner,
        admin,
        users: [user1, user2, user3],
    };
}

export function setupBlockchainSnapshot() {
    let snapshotId: string;

    beforeEach(async function () {
        snapshotId = await ethers.provider.send("evm_snapshot", []);
    });

    afterEach(async function () {
        await ethers.provider.send("evm_revert", [snapshotId]);
    });
}