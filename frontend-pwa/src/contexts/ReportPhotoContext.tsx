import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ReportPhotoDraft = {
  photoUri: string;
  photoFile: File;
  latitude: number | null;
  longitude: number | null;
  areaName: string | null;
};

type ReportPhotoContextValue = {
  draft: ReportPhotoDraft | null;
  setDraft: (draft: ReportPhotoDraft) => void;
  clearDraft: () => void;
};

const ReportPhotoContext = createContext<ReportPhotoContextValue | null>(null);

export function ReportPhotoProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<ReportPhotoDraft | null>(null);

  const setDraft = useCallback((next: ReportPhotoDraft) => {
    setDraftState(next);
  }, []);

  const clearDraft = useCallback(() => {
    setDraftState(null);
  }, []);

  const value = useMemo(
    () => ({ draft, setDraft, clearDraft }),
    [draft, setDraft, clearDraft],
  );

  return (
    <ReportPhotoContext.Provider value={value}>
      {children}
    </ReportPhotoContext.Provider>
  );
}

export function useReportPhoto() {
  const context = useContext(ReportPhotoContext);
  if (!context) {
    throw new Error("useReportPhoto must be used within ReportPhotoProvider");
  }
  return context;
}
