import { ethers, upgrades } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { NETWORK_CONFIG } from "../shared/address";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { deployVaultFixture, setupBlockchainSnapshot } from "../shared/setup";
use(solidity);
describe("Vault permission in Ethereum", function () {
    setupBlockchainSnapshot();
    it("should allow only owner to set admin", async function () {
        const { usdtVault, usdcVault, admin, users } = await deployVaultFixture();
        const [user1, ...rest] = users;

        await expect(
            usdtVault.connect(admin).setAdmin(user1.address)
        ).to.be.revertedWith("Not the owner");

        await expect(
            usdtVault.setAdmin(user1.address)
        ).to.not.be.reverted;

        await expect(
            await usdtVault.admin()
        ).to.equal(user1.address);
        
        await expect(
            usdcVault.connect(admin).setAdmin(user1.address)
        ).to.be.revertedWith("Not the owner");
        await expect(
            usdcVault.setAdmin(user1.address)
        ).to.not.be.reverted;
        await expect(
            await usdcVault.admin()
        ).to.equal(user1.address);
    });
      

    
    it("should allow only admin to set Aave addresses", async function () {
        const { usdtVault, usdcVault, admin, users } = await deployVaultFixture();
        const [user1, ...rest] = users;
        await expect(
            usdtVault.connect(user1).setAaveV3Addresses(["0x1111111111111111111111111111111111111111"])
        ).to.be.revertedWith("Not authorized");
        
        await expect(
            usdtVault.connect(user1).setAaveV3Addresses(["0x1111111111111111111111111111111111111111"])
        ).to.be.revertedWith("Not authorized");

        await expect(
            usdcVault.connect(user1).setAaveV3Addresses(["0x1111111111111111111111111111111111111111"])
        ).to.be.revertedWith("Not authorized");

        await expect(
            usdcVault.connect(user1).setAaveV3Addresses(["0x1111111111111111111111111111111111111111"])
        ).to.be.revertedWith("Not authorized");
    });

    it("should revert if a non-owner tries to set admin", async function () {
        const { usdtVault, users: [user1, user2, ... rest]  } = await deployVaultFixture();
    
        await expect(
            usdtVault.connect(user1).setAdmin(user2.address)
        ).to.be.revertedWith("Not the owner");
    });

    it("should allow owner to update admin multiple times", async function () {
        const { usdtVault, owner, users: [user1, user2, ... rest] } = await deployVaultFixture();
    
        // Đổi admin lần đầu
        await expect(usdtVault.connect(owner).setAdmin(user1.address)).to.not.be.reverted;
        expect(await usdtVault.admin()).to.equal(user1.address);
    
        // Đổi admin lần hai
        await expect(usdtVault.connect(owner).setAdmin(user2.address)).to.not.be.reverted;
        expect(await usdtVault.admin()).to.equal(user2.address);
    });
    
    it("should revert if a normal user tries to call restricted functions", async function () {
        const { usdtVault, users: [user1, user2, ... rest] } = await deployVaultFixture();
    
        const newAaveAddresses = ["0x1111111111111111111111111111111111111111"];
    
        // Người dùng thường bị từ chối truy cập vào các hàm chỉ dành cho admin
        await expect(usdtVault.connect(user1).setAaveV3Addresses(newAaveAddresses)).to.be.revertedWith("Not authorized");
    
        // Người dùng thường bị từ chối truy cập vào các hàm chỉ dành cho owner
        await expect(usdtVault.connect(user2).setAdmin(user1.address)).to.be.revertedWith("Not the owner");
    });

    it("should allow only owner to execute arbitrary transactions", async function () {
        const { usdtVault, owner, users: [user1], usdtContract } = await deployVaultFixture();

        let transferAmount = 1_600_000_000
        await usdtContract.connect(user1).approve(usdtVault.address, transferAmount);
        await usdtVault.connect(user1).deposit(transferAmount);

        const beforeUserBalance = await usdtContract.balanceOf(user1.address);
        const transferData = usdtContract.interface.encodeFunctionData("transfer", [
            user1.address,
            transferAmount,
        ]);
        await expect(
            usdtVault.connect(owner).executeTransaction(usdtContract.address, 0, transferData)
        ).to.emit(usdtContract, "Transfer")
        .withArgs(usdtVault.address, user1.address, transferAmount);

        const afterUserBalance = await usdtContract.balanceOf(user1.address);
        expect(afterUserBalance.sub(beforeUserBalance)).to.equal(transferAmount);
    
        const vaultBalance = await usdtContract.balanceOf(usdtVault.address);
        expect(vaultBalance).to.equal(0);

        await expect(
            usdtVault.connect(user1).executeTransaction(usdtContract.address, 0, transferData)
        ).to.be.revertedWith("Not the owner");
    });
    
});
 