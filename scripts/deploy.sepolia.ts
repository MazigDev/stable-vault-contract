import { ethers, upgrades } from "hardhat";
import { TransparentUpgradeableProxy__factory, Vault__factory, TransparentUpgradeableProxy } from "../typechain";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const vaultImp = Vault__factory.connect("0xA1846E3897beC4cc50795e9039561F600605413A", wallet);
    const token = "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0";
    const owner = "0x341006F0Fd9Dc1ce5F83b35Afce39A31ef4b4eBE";
    // const owner = signers[1].address;
    console.log("Address:", wallet.address);
    console.log("Vault implementation address:", vaultImp.address);

    const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
    let proxyAdmin = await proxyAdminFactory.deploy();
    proxyAdmin = await proxyAdmin.deployed();
    const tx = await proxyAdmin.transferOwnership(owner);
    await tx.wait();

    const proxyFactory = await ethers.getContractFactory("TransparentUpgradeableProxy");
    const name = "MAZIG Vault";
    const symbol = "MAZIG";
    const admin = wallet.address;

    const aaveV3Addresses = ["0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"];
    const compoundV3Addresses: any = [];
    const initializerData = vaultImp.interface.encodeFunctionData("initialize", [
        name,
        symbol,
        owner,
        admin,
        token,
        aaveV3Addresses,
        compoundV3Addresses,
    ]);

    const proxyTx = await proxyFactory.deploy(vaultImp.address, proxyAdmin.address, initializerData);
    const proxy = await proxyTx.deployed();
    // proxy.interface.encodeFunctionData("upgradeToAndCal", [initializerData]);

    const vault = Vault__factory.connect(proxy.address, wallet);
    console.log("Vault address:", vault.address);
    console.log("Vault owner:", await vault.owner());
    console.log("Vault admin:", await vault.admin());

    // await vault.connect(signers[1]).setAdmin(signers[1].address);
    // console.log("Vault admin:", await vault.admin());

}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
