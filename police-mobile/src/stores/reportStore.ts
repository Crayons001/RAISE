import { create } from 'zustand';

export interface Report {
  id: string;
  reportNumber: string;
  status: 'pending' | 'complete';
  policeAbstractUri?: string;
  policeAbstractDate?: string;
  // Add other report fields as needed
}

interface ReportStore {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  getReport: (id: string) => Report | undefined;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  
  addReport: (report) => {
    set((state) => ({
      reports: [...state.reports, report],
    }));
  },

  updateReport: async (id, updates) => {
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === id ? { ...report, ...updates } : report
      ),
    }));
  },

  getReport: (id) => {
    return get().reports.find((report) => report.id === id);
  },
})); 