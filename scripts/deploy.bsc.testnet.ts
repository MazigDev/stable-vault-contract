import { ethers, upgrades } from "hardhat";
import { IUniswapV2Router02__factory, IERC20__factory, WETH__factory, ERC20__factory, ICompoundV2__factory, Vault__factory } from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    let tx;
    const MAX_UINT = ethers.BigNumber.from(2).pow(256).sub(1);
    const token = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
    const router = IUniswapV2Router02__factory.connect("0x83edf1deE1B730b7e8e13C00ba76027D63a51ac0", wallet);
    // tx = await router.swapExactBNBForTokens(
    //     0,
    //     ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", token],
    //     wallet.address,
    //     "1000000000000000000",
    //     { value: ethers.utils.parseEther("0.5") });
    // await tx.wait();

    const usdt = IERC20__factory.connect(token, wallet);
    // console.log(await usdt.balanceOf(wallet.address));

    // console.log(await usdt.balanceOf(wallet.address));

    // const vaultFatory = await ethers.getContractFactory("Vault");
    // const name = "MAZIG Vault";
    // const symbol = "MAZIG";
    // const admin = wallet.address;
    // const aaveV3Addresses: any = [];
    // const compoundV2Addresses = ["0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7"];
    // const vaultDeploy = await upgrades.deployProxy(
    //     vaultFatory,
    //     [name, symbol, admin, admin, token, aaveV3Addresses, compoundV2Addresses],
    //     { initializer: "initialize" }
    // );
    // const vault = await vaultDeploy.deployed();
    // console.log("Vault deployed to:", vault.address);

    const vault = Vault__factory.connect("0x05035124a03bA25Ad593Cd39b42777F94b813ecc", wallet);
    const amount = await usdt.balanceOf(wallet.address);
    const compoundV2Address = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
    const compoundV2 = ICompoundV2__factory.connect(compoundV2Address, wallet);
    // tx = await usdt.approve(vault.address, amount);
    // await tx.wait();

    // tx = await vault.deposit(amount);
    // await tx.wait();

    const amount2 = await vault.callStatic.balanceCompoundV2(compoundV2Address);
    console.log(amount2.toString());

    // tx = await vault.supplyCompoundV2(0, amount2);
    // await tx.wait();

    // console.log(await vault.callStatic.balanceCompoundV2(compoundV2Address));

    tx = await vault.withdrawCompoundV2(0, MAX_UINT);
    await tx.wait();

    console.log(await vault.callStatic.balanceCompoundV2(compoundV2Address));
    console.log(await compoundV2.balanceOf(vault.address));

    // console.log(await vault.balanceToken())

    // tx = await vault.requestDistribute(MAX_UINT);
    // await tx.wait();

    // tx = await vault.distribute(wallet.address);
    // await tx.wait();

    // console.log(await vault.callStatic.balanceCompoundV2(compoundV2Address));

}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
