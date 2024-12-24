import { ethers, upgrades } from "hardhat";
import { ERC20__factory, Vault__factory, IAaveV3__factory, WETH__factory, ICompoundV2__factory, IAaveV2__factory } from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const data = fs.readFileSync("./config/deployed.json", "utf-8");
    const parsed = JSON.parse(data);

    const vaultFatory = await ethers.getContractFactory("Vault");
    const upgrade = await upgrades.upgradeProxy(parsed.vault, vaultFatory);
    await upgrade.deployed();
}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
