import { create } from 'zustand';
import useToastStore from './toastStore';

// Alapértelmezett értékesítési célok 2026
const defaultSalesTargets = [
  { month: 'Január', planUnits: 30, planAvgPrice: 200000, planRevenue: 6000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Február', planUnits: 33, planAvgPrice: 200000, planRevenue: 6600000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Március', planUnits: 35, planAvgPrice: 200000, planRevenue: 7000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Április', planUnits: 38, planAvgPrice: 230000, planRevenue: 8740000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Május', planUnits: 40, planAvgPrice: 200000, planRevenue: 8000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Június', planUnits: 42, planAvgPrice: 200000, planRevenue: 8400000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Július', planUnits: 45, planAvgPrice: 240000, planRevenue: 10800000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Augusztus', planUnits: 47, planAvgPrice: 240000, planRevenue: 11280000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Szeptember', planUnits: 50, planAvgPrice: 200000, planRevenue: 10000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'Október', planUnits: 52, planAvgPrice: 200000, planRevenue: 10400000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'November', planUnits: 55, planAvgPrice: 200000, planRevenue: 11000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
  { month: 'December', planUnits: 58, planAvgPrice: 220000, planRevenue: 12760000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 }
];

const useSalesStore = create((set, get) => ({
  // State
  salesTargets: defaultSalesTargets,
  selectedYear: new Date().getFullYear(),
  showSalesTargetEdit: false,
  editingTarget: null,
  isLoading: false,

  // Actions
  setSalesTargets: (targets) => {
    set({ salesTargets: targets });
    useToastStore.getState().success('Értékesítési célok frissítve');
  },

  setSelectedYear: (year) => set({ selectedYear: year }),

  setShowSalesTargetEdit: (show) => set({ showSalesTargetEdit: show }),

  setEditingTarget: (target) => set({ editingTarget: target }),

  // Értékesítési célok kezelése
  updateSalesTarget: (monthIndex, updates) => {
    set((state) => ({
      salesTargets: state.salesTargets.map((target, index) =>
        index === monthIndex ? { ...target, ...updates } : target
      )
    }));
  },

  // Év szerinti célok generálása (növekedési stratégia: +50 egység/hónap évente)
  generateYearTargets: (year) => {
    const baseYear = 2026;
    const yearDiff = year - baseYear;
    const growthUnits = yearDiff * 50;

    return defaultSalesTargets.map((target) => ({
      ...target,
      planUnits: target.planUnits + growthUnits,
      planRevenue: (target.planUnits + growthUnits) * target.planAvgPrice
    }));
  },

  // Összesített statisztikák
  getTotalStats: () => {
    const targets = get().salesTargets;
    return {
      totalPlanUnits: targets.reduce((sum, t) => sum + t.planUnits, 0),
      totalPlanRevenue: targets.reduce((sum, t) => sum + t.planRevenue, 0),
      totalActualUnits: targets.reduce((sum, t) => sum + t.actualUnits, 0),
      totalActualRevenue: targets.reduce((sum, t) => sum + t.actualRevenue, 0),
      completionRate: targets.reduce((sum, t) => sum + (t.planUnits > 0 ? (t.actualUnits / t.planUnits) * 100 : 0), 0) / targets.length
    };
  },

  // Havi statisztikák
  getMonthlyStats: (monthIndex) => {
    const target = get().salesTargets[monthIndex];
    if (!target) return null;

    return {
      ...target,
      completionRate: target.planUnits > 0 ? (target.actualUnits / target.planUnits) * 100 : 0,
      revenueCompletionRate: target.planRevenue > 0 ? (target.actualRevenue / target.planRevenue) * 100 : 0
    };
  }
}));

export default useSalesStore;

