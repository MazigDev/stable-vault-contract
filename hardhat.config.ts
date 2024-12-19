import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";

// import "@openzeppelin/contracts-upgradeable";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  gasReporter: {
    enabled: true,                // Bật báo cáo gas
    currency: "USD",              // Đơn vị tiền tệ
    gasPrice: 0.0000000004, 
               // Giá gas mặc định
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://ethereum-rpc.publicnode.com",
        blockNumber: 21412492// Optional: specify a block number to fork from
      },
      accounts: [
        {
          privateKey: "0xdcaebd58156b8a2805d9392c1c32c04e250044f8365d7db312f1f4fecaa819ba",
          balance: "10000000000000000000000" // 10,000 ETH
        }
      ],
      allowUnlimitedContractSize: true
    },
    ethereum: {
      url: "https://eth.drpc.org",
      accounts: {
        mnemonic: process.env.TEST_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      }
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;