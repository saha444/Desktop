"use client";

import { useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";

// Sepolia chain ID
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    isCorrectNetwork: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

export interface UseWalletReturn extends WalletState {
    connect: () => Promise<void>;
    disconnect: () => void;
    switchToSepolia: () => Promise<void>;
}

// LocalStorage key for tracking manual disconnect
const DISCONNECT_KEY = "paycheck_wallet_disconnected";

export function useWallet(): UseWalletReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID_DECIMAL;

    // Check current MetaMask state on mount
    // This checks if wallet is CURRENTLY connected (not from saved state)
    useEffect(() => {
        const checkCurrentConnection = async () => {
            if (typeof window === "undefined" || !window.ethereum) {
                setIsInitialized(true);
                return;
            }

            try {
                // Check if user manually disconnected
                const wasDisconnected = localStorage.getItem(DISCONNECT_KEY) === "true";

                if (wasDisconnected) {
                    // User manually disconnected, don't auto-reconnect
                    console.log("User previously disconnected, skipping auto-connect");
                    setIsInitialized(true);
                    return;
                }

                // eth_accounts returns currently connected accounts without prompting
                // This detects if the wallet is actively connected in the current session
                const accounts = await window.ethereum.request({
                    method: "eth_accounts"
                }) as string[];

                if (accounts.length > 0) {
                    const chainIdHex = await window.ethereum.request({
                        method: "eth_chainId"
                    }) as string;
                    setAddress(accounts[0]);
                    setChainId(parseInt(chainIdHex, 16));
                    setIsConnected(true);
                }
            } catch (err) {
                console.error("Failed to check wallet connection:", err);
            } finally {
                setIsInitialized(true);
            }
        };

        checkCurrentConnection();
    }, []);

    // Listen for account and chain changes
    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum) return;

        const handleAccountsChanged = (accounts: unknown) => {
            const accountList = accounts as string[];
            if (accountList.length === 0) {
                // User disconnected from MetaMask
                setIsConnected(false);
                setAddress(null);
                setChainId(null);
            } else {
                setAddress(accountList[0]);
                setIsConnected(true);
            }
        };

        const handleChainChanged = (chainIdHex: unknown) => {
            setChainId(parseInt(chainIdHex as string, 16));
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum?.removeListener("chainChanged", handleChainChanged);
        };
    }, []);

    const connect = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (typeof window === "undefined" || !window.ethereum) {
                throw new Error("Please install MetaMask to continue");
            }

            // Clear the disconnect flag when connecting
            localStorage.removeItem(DISCONNECT_KEY);

            // Always request fresh account access - this prompts MetaMask popup
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            }) as string[];

            // Get chain ID
            const chainIdHex = await window.ethereum.request({
                method: "eth_chainId",
            }) as string;

            setAddress(accounts[0]);
            setChainId(parseInt(chainIdHex, 16));
            setIsConnected(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to connect wallet";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        // Mark that user manually disconnected
        localStorage.setItem(DISCONNECT_KEY, "true");

        setIsConnected(false);
        setAddress(null);
        setChainId(null);
        setError(null);
    }, []);

    const switchToSepolia = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (typeof window === "undefined" || !window.ethereum) {
                throw new Error("MetaMask is not installed");
            }

            try {
                // Try to switch to Sepolia
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: SEPOLIA_CHAIN_ID }],
                });
            } catch (switchError: unknown) {
                // If Sepolia is not added, add it
                const err = switchError as { code?: number };
                if (err.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: SEPOLIA_CHAIN_ID,
                                chainName: "Sepolia Testnet",
                                nativeCurrency: {
                                    name: "Sepolia ETH",
                                    symbol: "ETH",
                                    decimals: 18,
                                },
                                rpcUrls: ["https://sepolia.infura.io/v3/"],
                                blockExplorerUrls: ["https://sepolia.etherscan.io"],
                            },
                        ],
                    });
                } else {
                    throw switchError;
                }
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to switch network";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isConnected,
        address,
        chainId,
        isCorrectNetwork,
        isLoading,
        isInitialized,
        error,
        connect,
        disconnect,
        switchToSepolia,
    };
}

// Add ethereum type to window
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, callback: (...args: unknown[]) => void) => void;
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
        };
    }
}
