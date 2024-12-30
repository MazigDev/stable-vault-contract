export const NETWORK_CONFIG = {
    ETHEREUM: {
        TOKENS: {
            USDT: {
                address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Mainnet USDT
                decimals: 6,
            },
            USDC: {
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Mainnet USDC
                decimals: 6,
            },
            NATIVE: {
                address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // Mainnet WETH
                decimals: 18,
                name: "WETH",
            }
        },
        LENDING_POOLS: {
            AAVE: {
                pool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Aave V3 Pool
                lendingPoolAddressProvider: "0xb53C1a33016B2DC2fF3653530bFF1848a515c8c5", // Aave Lending Pool
                dataProvider: "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d", // Aave Protocol Data Provider
            },
            COMPOUND: {
                cUSDT: "0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840", // Compound cUSDT
                cUSDC: "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // Compound cUSDC
                comptroller: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B", // Compound Comptroller
            },
            VENUS: {
                vUSDT: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // Venus vUSDT
                vUSDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // Venus vUSDC
                comptroller: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // Venus Comptroller
            }
        },
        UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
    },
    BSC: {
        TOKENS: {
            USDT: {
                address: "0x55d398326f99059fF775485246999027B3197955", // BSC USDT
                decimals: 18,
            },
            USDC: {
                address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC USDC
                decimals: 18,
            },
            NATIVE: {
                address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BSC WBNB 
                decimals: 18,
                name: "WBNB",
            }
        },
        LENDING_POOLS: {
            AAVE: {
                pool: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC Aave V3 Pool
                lendingPoolAddressProvider: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC Aave Lending Pool
                dataProvider: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC Aave Protocol Data Provider
            },
            COMPOUND: {
                cUSDT: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC Compound cUSDT
                cUSDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC Compound cUSDC
                comptroller: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC Compound Comptroller
            },
            VENUS: {
                vUSDT: "0xfD5840Cd36d94D7229439859C0112a4185BC0255", // Venus vUSDT
                vUSDC: "0xeca88125a5adbe82614ffc12d0db554e2e2867c8", // Venus vUSDC
                comptroller: "0xfD36E2c2a6789Db23113685031d7F16329158384", // Venus Comptroller
            },
        },
        UNISWAP_V2_ROUTER: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24", // Uniswap V2 Router
    },
};
