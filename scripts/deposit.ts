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

    console.log((await vault.callStatic.totalTokenSupply()).toString());
    // const weth = WETH__factory.connect("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", wallet);
    // await weth.deposit({ value: ethers.utils.parseEther("1") });

    // ? deposit
    // const balance = await usdc.balanceOf(wallet.address);
    // console.log(balance.toString());
    // let txapp = await usdc.approve(vault.address, balance);
    // await txapp.wait();
    // let tx = await vault.deposit(balance);
    // await tx.wait();

    // ? supply
    await vault.supplyAaveV3(0, "1710162397");
    // await vault.supplyCompoundV3(0, "2710162397");
    // await vault.supplyAaveV2(0, "1220355599");
    // await vault.supplyCompoundV2(0, "2710162397");

    // ? withdraw
    // await vault.withdrawAaveV3(0, MAX_UINT);
    // await vault.withdrawCompoundV3(0, MAX_UINT);
    // await vault.withdrawAaveV2(0, MAX_UINT);
    // await vault.withdrawCompoundV2(0, MAX_UINT);

    // ? mine 1000 blocks
    // for (let i = 0; i < 1000; i++) {
    //     await ethers.provider.send("evm_increaseTime", [60 * 60 * 24]);
    //     await ethers.provider.send("evm_mine", []);
    // }
    // const latestBlock = await ethers.provider.getBlock("latest");
    // console.log(latestBlock.timestamp);

    // ? borrow
    // const aaveV3 = IAaveV3__factory.connect("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", wallet);
    // console.log((await usdc.balanceOf(wallet.address)).toString());
    // const balance = await weth.balanceOf(wallet.address);
    // await weth.approve(aaveV3.address, balance);
    // await aaveV3.supply("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", balance, wallet.address, 0);
    // await aaveV3.setUserUseReserveAsCollateral("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", true);
    // await aaveV3.borrow(parsed.token, "216966611", 2, 0, wallet.address);
    // console.log((await usdc.balanceOf(wallet.address)).toString());
    // console.log(await aaveV3.getUserAccountData(wallet.address));
    // console.log((await aaveV3.getReserveData(parsed.token)));
    // await aaveV3.withdraw(parsed.token, balance, wallet.address);
    // const balance = (await weth.balanceOf(wallet.address)).toString();

    // ? total supply
    // const totalSupply = (await vault.totalTokenSupply()).toString();
    // console.log(totalSupply);
    // console.log((await vault.balanceCompoundV3("0xc3d688B66703497DAA19211EEdff47f25384cdc3")).toString());
    // console.log((await vault.balanceAaveV2("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9")).toString());
    // const compoundV2 = ICompoundV2__factory.connect("0x39AA39c021dfbaE8faC545936693aC917d5E7563", wallet);

    // console.log((await vault.balanceAaveV2("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9")).toString());
    // console.log((await vault.balanceAaveV3("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2")).toString());
    // console.log(await vault.balanceCompoundV3("0xc3d688B66703497DAA19211EEdff47f25384cdc3"));
    // console.log(await vault.callStatic.balanceCompoundV2("0x39AA39c021dfbaE8faC545936693aC917d5E7563"));
    // console.log((await vault.callStatic.totalTokenSupply()));

    // const aaveV2 = IAaveV2__factory.connect("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", wallet);
    // console.log(parsed.token);
    // console.log((await aaveV2.getReserveData(parsed.token)));

    // console.log((await vault.callStatic.totalTokenSupply()).toString());
    // await usdc.approve(aaveV3.address, "223717095");
    // await aaveV3.supply(parsed.token, "123717095", wallet.address, 0);
    // console.log(await usdc.allowance(wallet.address, aaveV3.address));

}

test().catch((error) => {
  console.error(error);
  process.exit(1);
});
