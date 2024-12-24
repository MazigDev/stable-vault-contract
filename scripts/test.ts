import { ethers, upgrades } from "hardhat";
import { WETH__factory, ICompoundV3__factory } from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const data = fs.readFileSync("./config/deployed.json", "utf-8");
    const weth = WETH__factory.connect("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", wallet);
    const compound = ICompoundV3__factory.connect("0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840", wallet);
    const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

    await weth.deposit({ value: ethers.utils.parseEther("10") });
    await weth.approve(compound.address, ethers.utils.parseEther("1"));
    await compound.supply(weth.address, ethers.utils.parseEther("1"));
    await compound.withdraw(usdt, 1_000_000_000)
}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
