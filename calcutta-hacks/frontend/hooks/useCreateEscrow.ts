"use client";

import { useState, useCallback } from "react";
import { useWallet } from "./useWallet";

export type CreateEscrowStep = 1 | 2 | 3;

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface MilestoneFormData {
    counterpartyAddress: string;
    description: string;
    deadline: string; // ISO date string
    milestoneValue: string; // ETH
}

export interface RiskIssue {
    id: string;
    type: "warning" | "error";
    title: string;
    description: string;
}

export interface RiskScanResult {
    riskLevel: RiskLevel;
    score: number; // 0-100
    issues: RiskIssue[];
    scannedAt: Date;
}

export interface UseCreateEscrowReturn {
    // Step management
    currentStep: CreateEscrowStep;
    setStep: (step: CreateEscrowStep) => void;
    canProceed: boolean;

    // Form data
    formData: MilestoneFormData;
    updateFormData: (data: Partial<MilestoneFormData>) => void;
    formErrors: Record<string, string>;
    validateForm: () => boolean;

    // Risk scan
    riskScan: RiskScanResult | null;
    isScanning: boolean;
    runRiskScan: () => Promise<void>;
    acknowledgedRisks: boolean;
    setAcknowledgedRisks: (value: boolean) => void;

    // Deployment
    isDeploying: boolean;
    deployError: string | null;
    gasEstimate: string | null;
    deployEscrow: () => Promise<string | null>;
}

const initialFormData: MilestoneFormData = {
    counterpartyAddress: "",
    description: "",
    deadline: "",
    milestoneValue: "",
};

// Simulated AI risk scanning
async function simulateRiskScan(formData: MilestoneFormData): Promise<RiskScanResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const issues: RiskIssue[] = [];
    let riskScore = 0;

    // Check for ambiguous scope
    if (formData.description.length < 50) {
        issues.push({
            id: "ambiguous-scope",
            type: "warning",
            title: "Ambiguous Scope",
            description: "The milestone description is brief. Consider adding more specific deliverables.",
        });
        riskScore += 20;
    }

    // Check for tight deadline
    const deadlineDate = new Date(formData.deadline);
    const daysUntilDeadline = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline < 3) {
        issues.push({
            id: "tight-deadline",
            type: "error",
            title: "Tight Deadline",
            description: "The deadline is less than 3 days away. This may increase dispute risk.",
        });
        riskScore += 30;
    } else if (daysUntilDeadline < 7) {
        issues.push({
            id: "short-deadline",
            type: "warning",
            title: "Short Deadline",
            description: "Consider allowing more time for quality deliverables.",
        });
        riskScore += 15;
    }

    // Check for weak deliverable definition
    const weakKeywords = ["etc", "maybe", "possibly", "if possible", "try to"];
    const hasWeakLanguage = weakKeywords.some((kw) =>
        formData.description.toLowerCase().includes(kw)
    );
    if (hasWeakLanguage) {
        issues.push({
            id: "weak-deliverable",
            type: "warning",
            title: "Weak Deliverable Definition",
            description: "The description contains uncertain language. Be specific about requirements.",
        });
        riskScore += 15;
    }

    // Check milestone value
    const value = parseFloat(formData.milestoneValue);
    if (value > 5) {
        issues.push({
            id: "high-value",
            type: "warning",
            title: "High Value Transaction",
            description: "Consider breaking large milestones into smaller deliverables.",
        });
        riskScore += 10;
    }

    // Add some randomness for demo
    if (issues.length === 0) {
        riskScore = Math.floor(Math.random() * 20);
    }

    let riskLevel: RiskLevel = "LOW";
    if (riskScore >= 50) {
        riskLevel = "HIGH";
    } else if (riskScore >= 25) {
        riskLevel = "MEDIUM";
    }

    return {
        riskLevel,
        score: Math.min(100, riskScore),
        issues,
        scannedAt: new Date(),
    };
}

export function useCreateEscrow(): UseCreateEscrowReturn {
    const { isConnected } = useWallet();
    const [currentStep, setCurrentStep] = useState<CreateEscrowStep>(1);
    const [formData, setFormData] = useState<MilestoneFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Risk scan state
    const [riskScan, setRiskScan] = useState<RiskScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [acknowledgedRisks, setAcknowledgedRisks] = useState(false);

    // Deployment state
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployError, setDeployError] = useState<string | null>(null);
    const [gasEstimate, setGasEstimate] = useState<string | null>("0.002");

    const updateFormData = useCallback((data: Partial<MilestoneFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
        // Clear errors for updated fields
        const clearedErrors = { ...formErrors };
        Object.keys(data).forEach((key) => {
            delete clearedErrors[key];
        });
        setFormErrors(clearedErrors);
    }, [formErrors]);

    const validateForm = useCallback((): boolean => {
        const errors: Record<string, string> = {};

        // Validate counterparty address
        if (!formData.counterpartyAddress) {
            errors.counterpartyAddress = "Wallet address is required";
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.counterpartyAddress)) {
            errors.counterpartyAddress = "Invalid Ethereum address";
        }

        // Validate description
        if (!formData.description) {
            errors.description = "Description is required";
        } else if (formData.description.length < 10) {
            errors.description = "Description must be at least 10 characters";
        }

        // Validate deadline
        if (!formData.deadline) {
            errors.deadline = "Deadline is required";
        } else {
            const deadlineDate = new Date(formData.deadline);
            if (deadlineDate <= new Date()) {
                errors.deadline = "Deadline must be in the future";
            }
        }

        // Validate milestone value
        if (!formData.milestoneValue) {
            errors.milestoneValue = "Milestone value is required";
        } else {
            const value = parseFloat(formData.milestoneValue);
            if (isNaN(value) || value <= 0) {
                errors.milestoneValue = "Must be a positive number";
            } else if (value < 0.001) {
                errors.milestoneValue = "Minimum value is 0.001 ETH";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const runRiskScan = useCallback(async () => {
        setIsScanning(true);
        setAcknowledgedRisks(false);
        try {
            const result = await simulateRiskScan(formData);
            setRiskScan(result);
        } finally {
            setIsScanning(false);
        }
    }, [formData]);

    const setStep = useCallback((step: CreateEscrowStep) => {
        if (step === 2 && currentStep === 1) {
            if (validateForm()) {
                setCurrentStep(2);
                runRiskScan();
            }
        } else if (step === 3 && currentStep === 2) {
            if (acknowledgedRisks) {
                setCurrentStep(3);
            }
        } else if (step < currentStep) {
            setCurrentStep(step);
        }
    }, [currentStep, validateForm, runRiskScan, acknowledgedRisks]);

    const deployEscrow = useCallback(async (): Promise<string | null> => {
        if (!isConnected) {
            setDeployError("Wallet not connected");
            return null;
        }

        setIsDeploying(true);
        setDeployError(null);

        try {
            // Simulate deployment delay (in production, this would deploy the actual contract)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Generate mock escrow address for demo
            // In production, this would be the actual deployed contract address
            const mockAddress = "0x" + Array(40)
                .fill(0)
                .map(() => Math.floor(Math.random() * 16).toString(16))
                .join("");

            // Store the escrow in localStorage for dashboard tracking
            const ESCROWS_STORAGE_KEY = "paycheck_escrows";
            const storedEscrows = (() => {
                try {
                    const stored = localStorage.getItem(ESCROWS_STORAGE_KEY);
                    return stored ? JSON.parse(stored) : [];
                } catch {
                    return [];
                }
            })();

            storedEscrows.push({
                address: mockAddress,
                role: "client", // Creator is the client
                counterparty: formData.counterpartyAddress,
                milestoneValue: formData.milestoneValue,
                createdAt: new Date().toISOString(),
            });

            localStorage.setItem(ESCROWS_STORAGE_KEY, JSON.stringify(storedEscrows));
            console.log("Escrow deployed and stored:", mockAddress);

            return mockAddress;
        } catch (err) {
            setDeployError(err instanceof Error ? err.message : "Deployment failed");
            return null;
        } finally {
            setIsDeploying(false);
        }
    }, [isConnected, formData.counterpartyAddress, formData.milestoneValue]);

    const canProceed = (() => {
        switch (currentStep) {
            case 1:
                return Boolean(
                    formData.counterpartyAddress &&
                    formData.description &&
                    formData.deadline &&
                    formData.milestoneValue
                );
            case 2:
                return riskScan !== null && acknowledgedRisks;
            case 3:
                return !isDeploying;
            default:
                return false;
        }
    })();

    return {
        currentStep,
        setStep,
        canProceed,
        formData,
        updateFormData,
        formErrors,
        validateForm,
        riskScan,
        isScanning,
        runRiskScan,
        acknowledgedRisks,
        setAcknowledgedRisks,
        isDeploying,
        deployError,
        gasEstimate,
        deployEscrow,
    };
}
