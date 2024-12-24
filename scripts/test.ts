import { ethers, upgrades } from "hardhat";
import { WETH__factory, ICompoundV3__factory, ERC20__factory } from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    // const data = fs.readFileSync("./config/deployed.json", "utf-8");
    // const weth = WETH__factory.connect("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", wallet);
    // const compound = ICompoundV3__factory.connect("0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840", wallet);
    // const usdt = ERC20__factory.connect("0xdAC17F958D2ee523a2206206994597C13D831ec7", wallet);

    // await weth.deposit({ value: ethers.utils.parseEther("1000") });
    // await weth.approve(compound.address, ethers.utils.parseEther("1000"));
    // await compound.supply(weth.address, ethers.utils.parseEther("1000"));
    // await compound.withdraw(usdt.address, 2000_000_000_000)
    // console.log("USDT balance:", (await usdt.balanceOf(wallet.address)).toString());

    // ? mine 1000 blocks
    for (let i = 0; i < 365 * 2; i++) {
        await ethers.provider.send("evm_increaseTime", [60 * 60 * 12]);
        await ethers.provider.send("evm_mine", []);
    }
}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
