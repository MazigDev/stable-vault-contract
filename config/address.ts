export const NETWORK_CONFIG = {
    ETHEREUM: {
        TOKENS: {
            USDT: {
                address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Mainnet USDT
                decimals: 6,
            },
            USDC: {
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48", // Mainnet USDC
                decimals: 6,
            },
        },
        LENDING_POOLS: {
            AAVE: {
                lendingPoolAddressProvider: "0xb53C1a33016B2DC2fF3653530bFF1848a515c8c5", // Aave Lending Pool
                dataProvider: "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d", // Aave Protocol Data Provider
            },
            COMPOUND: {
                cUSDT: "0xf650C3d88Cc861C1dF7bA4072b6360d2fD5Df0D3", // Compound cUSDT
                cUSDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563", // Compound cUSDC
                comptroller: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B", // Compound Comptroller
            },
        },
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
        },
        LENDING_POOLS: {
            VENUS: {
                vUSDT: "0xfD5840Cd36d94D7229439859C0112a4185BC0255", // Venus vUSDT
                vUSDC: "0xeca88125a5adbe82614ffc12d0db554e2e2867c8", // Venus vUSDC
                comptroller: "0xfD36E2c2a6789Db23113685031d7F16329158384", // Venus Comptroller
            },
        },
    },
};
