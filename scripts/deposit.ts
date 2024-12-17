import { ethers, upgrades } from "hardhat";
import { ERC20__factory , Vault__factory} from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const data = fs.readFileSync("./config/deployed.json", "utf-8");
    const parsed = JSON.parse(data);
    const vault = Vault__factory.connect(parsed.vault, wallet);
    const usdc = ERC20__factory.connect(parsed.token, wallet);
    const balance = await usdc.balanceOf(wallet.address);
    console.log(balance.toString());
    let txapp = await usdc.approve(vault.address, balance);
    await txapp.wait();
    let tx = await vault.deposit(balance);
    await tx.wait();
}

test().catch((error) => {
  console.error(error);
  process.exit(1);
});
