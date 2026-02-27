'use client';

import { create } from 'zustand';
import type {
  Organization,
  Department,
  Vendor,
  Transaction,
  Contract,
  Flag,
  FlagStatus,
  FilterState,
  DashboardStats,
  Investigation,
} from '@/types';

interface TrialSummary {
  totalTransactions: number;
  totalSpend: number;
  flagsDetected: number;
  estimatedWaste: number;
  duplicatesFound: number;
  benfordAnomaly: boolean;
}

interface AppState {
  // Organization
  organization: Organization | null;
  setOrganization: (org: Organization) => void;

  // Data
  departments: Department[];
  vendors: Vendor[];
  transactions: Transaction[];
  contracts: Contract[];
  flags: Flag[];
  investigations: Investigation[];
  setDepartments: (deps: Department[]) => void;
  setVendors: (vendors: Vendor[]) => void;
  setTransactions: (txns: Transaction[]) => void;
  setContracts: (contracts: Contract[]) => void;
  setFlags: (flags: Flag[]) => void;
  setInvestigations: (investigations: Investigation[]) => void;

  // Flag management
  updateFlagStatus: (flagId: string, status: FlagStatus, assignee?: string) => void;

  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Fiscal period
  fiscalPeriod: string;
  setFiscalPeriod: (period: string) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Search
  globalSearch: string;
  setGlobalSearch: (search: string) => void;

  // Demo mode
  isDemo: boolean;
  setIsDemo: (demo: boolean) => void;

  // Trial mode
  isTrial: boolean;
  setIsTrial: (trial: boolean) => void;
  trialSummary: TrialSummary | null;
  setTrialSummary: (summary: TrialSummary | null) => void;

  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Computed
  dashboardStats: () => DashboardStats;

  // Bulk load
  loadDemoData: (data: {
    organization: Organization;
    departments: Department[];
    vendors: Vendor[];
    transactions: Transaction[];
    contracts: Contract[];
    flags: Flag[];
    investigations?: Investigation[];
  }) => void;

  clearData: () => void;
}

const defaultFilters: FilterState = {
  dateRange: { from: null, to: null },
  departments: [],
  vendors: [],
  categories: [],
  amountRange: { min: null, max: null },
  flagStatus: [],
  severity: [],
};

export const useStore = create<AppState>((set, get) => ({
  organization: null,
  setOrganization: (org) => set({ organization: org }),

  departments: [],
  vendors: [],
  transactions: [],
  contracts: [],
  flags: [],
  investigations: [],
  setDepartments: (departments) => set({ departments }),
  setVendors: (vendors) => set({ vendors }),
  setTransactions: (transactions) => set({ transactions }),
  setContracts: (contracts) => set({ contracts }),
  setFlags: (flags) => set({ flags }),
  setInvestigations: (investigations) => set({ investigations }),

  updateFlagStatus: (flagId, status, assignee) =>
    set((state) => ({
      flags: state.flags.map((f) =>
        f.id === flagId
          ? { ...f, status, assignee: assignee || f.assignee, updatedAt: new Date() }
          : f
      ),
    })),

  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),

  fiscalPeriod: 'FY2025',
  setFiscalPeriod: (fiscalPeriod) => set({ fiscalPeriod }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),

  globalSearch: '',
  setGlobalSearch: (globalSearch) => set({ globalSearch }),

  isDemo: false,
  setIsDemo: (isDemo) => set({ isDemo }),

  isTrial: false,
  setIsTrial: (isTrial) => set({ isTrial }),
  trialSummary: null,
  setTrialSummary: (trialSummary) => set({ trialSummary }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  dashboardStats: () => {
    const { transactions, flags, departments } = get();
    const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
    const wasteDetected = flags
      .filter((f) => f.status !== 'dismissed' && f.status !== 'resolved')
      .reduce((sum, f) => sum + f.estimatedWaste, 0);
    const savingsOpportunities = wasteDetected * 0.7;
    const totalBudget = departments.reduce((sum, d) => sum + d.allocatedBudget, 0);
    const riskScore = totalBudget > 0
      ? Math.min(100, Math.round((wasteDetected / totalBudget) * 1000))
      : 0;

    return {
      totalSpend,
      totalSpendChange: 3.2,
      wasteDetected,
      wasteDetectedChange: -12.5,
      savingsOpportunities,
      savingsChange: 8.3,
      riskScore,
      riskScoreChange: -5,
    };
  },

  loadDemoData: (data) =>
    set({
      organization: data.organization,
      departments: data.departments,
      vendors: data.vendors,
      transactions: data.transactions,
      contracts: data.contracts,
      flags: data.flags,
      investigations: data.investigations || [],
      isDemo: true,
      isLoading: false,
    }),

  clearData: () =>
    set({
      organization: null,
      departments: [],
      vendors: [],
      transactions: [],
      contracts: [],
      flags: [],
      investigations: [],
      isDemo: false,
      isTrial: false,
      trialSummary: null,
      filters: defaultFilters,
    }),
}));
