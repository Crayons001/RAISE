import { create } from 'zustand';

export interface Report {
  id: string;
  reportNumber: string;
  status: 'pending' | 'complete';
  policeAbstractUri?: string;
  policeAbstractDate?: string;
  location: string;
  date: string;
  time: string;
  description: string;
  vehicles: Array<{
    registrationNumber: string;
    make: string;
    model: string;
    damage: string;
  }>;
  evidence: Array<{
    type: 'image' | 'document';
    uri: string;
    description: string;
  }>;
}

interface ReportStore {
  reports: Report[];
  nextReportId: number;
  addReport: (report: Omit<Report, 'id' | 'reportNumber'>) => void;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  getReport: (id: string) => Report | undefined;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  nextReportId: 1,
  
  addReport: (report) => {
    set((state) => {
      const newId = state.nextReportId.toString();
      const reportNumber = `RPT-${newId.padStart(4, '0')}`;
      return {
        reports: [...state.reports, { ...report, id: newId, reportNumber }],
        nextReportId: state.nextReportId + 1,
      };
    });
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