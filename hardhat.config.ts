import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-waffle";
import '@typechain/hardhat'

// import "@openzeppelin/contracts-upgradeable";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  gasReporter: {
    enabled: true,                // Bật báo cáo gas
    currency: "USD",              // Đơn vị tiền tệ
    gasPrice: 0.0000000004, 
    forceTerminalOutputFormat: "legacy"
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://ethereum-rpc.publicnode.com",
        blockNumber: 21412492// Optional: specify a block number to fork from
      },
      accounts: [
        {
          privateKey: "0x59c6995e998f97a5a0044975f1acbee8f4d78b49d8d2a6ef1b3e5e4a6f5d1b66",
          balance: "20000000000000000000000" // 20,000 ETH
        },
        {
          privateKey: "0x2f8c7cf025070afe2f7b3d7fcdd9a0d073c4053b1a1d6b9985d642a08db7e13a",
          balance: "20000000000000000000000" // 20,000 ETH
        },
        {
          privateKey: "0x1cdeb77d109ab2530c4822d9e2f39ab9e050c69a5d080c2914dbe084c9eea481",
          balance: "20000000000000000000000" // 20,000 ETH
        },
        {
          privateKey: "0x4510ba81bf64df1d4a729cb0c4ded3f97c32f5cd8994cf7968bb3c29ac954603",
          balance: "20000000000000000000000" // 20,000 ETH
        },
        {
          privateKey: "0x922204d328dfabb82c5fa2f3c301e3c26fc8a309dba4877c403d9fdaed6e597e",
          balance: "20000000000000000000000" // 20,000 ETH
        }
      ],
      allowUnlimitedContractSize: true,
      gasPrice: 10564098716,
    },
    // ethereum: {
    //   url: "https://eth.drpc.org",
    //   accounts: {
    //     mnemonic: process.env.TEST_MNEMONIC,
    //     path: "m/44'/60'/0'/0",
    //     initialIndex: 0,
    //     count: 20,
    //     passphrase: "",
    //   }
    // },
    sepolia: {
      url: "https://eth-sepolia.public.blastapi.io",
      accounts: {
        mnemonic: process.env.TEST_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      }
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;