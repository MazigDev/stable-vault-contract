import { ethers, upgrades } from "hardhat";
import { WETH__factory, ICompoundV3__factory, ERC20__factory } from "../typechain";
import fs from "fs";


describe("Deploy", () => {
    it("should work", async () => {
        const signers = await ethers.getSigners();
        const wallet = signers[0];
        const token = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

        const vaultFatory = await ethers.getContractFactory("Vault");
        const name = "MAZIG Vault";
        const symbol = "MAZIG";
        const admin = wallet.address;
        const aaveV3Addresses = ["0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"];
        const compoundV3Addresses = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"];
        const vaultDeploy = await upgrades.deployProxy(vaultFatory, [name, symbol, admin, token, aaveV3Addresses, compoundV3Addresses], { initializer: "initialize" });
        const vault = await vaultDeploy.deployed();
    })
});