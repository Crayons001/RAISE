import { create, StateCreator } from 'zustand';
import { Report } from '../screens/ReportDetailsScreen';

interface ReportsState {
  reports: Report[];
  addReport: (report: Omit<Report, 'id'>) => void;
  updateReport: (id: number, report: Partial<Report>) => void;
  deleteReport: (id: number) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],
  addReport: (report: Omit<Report, 'id'>) => set((state: ReportsState) => ({
    reports: [
      {
        ...report,
        id: state.reports.length > 0 
          ? Math.max(...state.reports.map((r: Report) => r.id)) + 1 
          : 1,
      },
      ...state.reports,
    ],
  })),
  updateReport: (id: number, report: Partial<Report>) => set((state: ReportsState) => ({
    reports: state.reports.map((r: Report) => 
      r.id === id ? { ...r, ...report } : r
    ),
  })),
  deleteReport: (id: number) => set((state: ReportsState) => ({
    reports: state.reports.filter((r: Report) => r.id !== id),
  })),
})); 