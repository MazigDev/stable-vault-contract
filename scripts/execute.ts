import { ethers, upgrades } from "hardhat";
import { ERC20__factory, Vault__factory, IAaveV3__factory, WETH__factory, ICompoundV2__factory, IAaveV2__factory } from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const data = fs.readFileSync("./config/deployed.json", "utf-8");
    const parsed = JSON.parse(data);
    const vault = Vault__factory.connect(parsed.vault, wallet);
    const usdc = ERC20__factory.connect(parsed.token, wallet);
    const MAX_UINT = ethers.BigNumber.from(2).pow(256).sub(1);
    console.log("Vault address:", vault.address);
    console.log((await vault.totalTokenSupply()).toString());

    // ? deposit
    await usdc.approve(vault.address, 1_600_000_000);
    await vault.deposit(1_600_000_000);

    // ? supply
    await vault.supplyAaveV3(0, 400_000_000);
    await vault.supplyCompoundV3(0, 400_000_000);

    console.log("Init total token supply:", (await vault.callStatic.totalTokenSupply()).toString())

    // ? mine 1000 blocks
    for (let i = 0; i < 365 * 2; i++) {
        await ethers.provider.send("evm_increaseTime", [60 * 60 * 12]);
        await ethers.provider.send("evm_mine", []);
    }

    console.log("APR Aave V3:", (await vault.balanceAaveV3((await vault.aaveV3Addresses(0)))).toNumber() / 400_000_000 - 1)
    console.log("APR Compound V3:", (await vault.balanceCompoundV3((await vault.compoundV3Addresses(0)))).toNumber() / 400_000_000 - 1)

    // ? withdraw
    await vault.withdrawAaveV3(0, MAX_UINT);
    await vault.withdrawCompoundV3(0, MAX_UINT);

    const totalTokenSupply = await vault.callStatic.totalTokenSupply();
    console.log("totalTokenSupply 1:", totalTokenSupply.toString())

    // ? deposit 2
    console.log("USDC balance:", (await usdc.balanceOf(wallet.address)).toString());
    const balanceLP = await vault.balanceOf(wallet.address);
    console.log("Pre balance LP:", balanceLP.toString());

    // deposit should receive balanceLP
    console.log("Deposit totalTokenSupply 1");
    await usdc.approve(vault.address, totalTokenSupply);
    await vault.deposit(totalTokenSupply);

    console.log("Withdraw pre balance LP (should receive totalTokenSupply 1");
    await vault.requestDistribute(balanceLP);
    await vault.distribute(wallet.address);
    console.log("Post USDC balance:", (await usdc.balanceOf(wallet.address)).toString());

    console.log("Withdraw post balance LP (should receive totalTokenSupply 1");
    await vault.requestDistribute(balanceLP);
    await vault.distribute(wallet.address);
    console.log("Post USDC balance:", (await usdc.balanceOf(wallet.address)).toString());

    console.log("Final totalTokenSupply (should equal to 0):", (await vault.callStatic.totalTokenSupply()).toString());
}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
