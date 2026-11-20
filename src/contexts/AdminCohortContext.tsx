import { createContext, useContext, useState, ReactNode } from "react";

export type Cohort = "Cohort 1" | "Cohort 2" | "Cohort 3" | "Cohort 4";
export const ADMIN_COHORTS: Cohort[] = ["Cohort 1", "Cohort 2", "Cohort 3", "Cohort 4"];

interface AdminCohortContextType {
  cohort: Cohort;
  setCohort: (c: Cohort) => void;
}

const AdminCohortContext = createContext<AdminCohortContextType | undefined>(undefined);

export const AdminCohortProvider = ({ children }: { children: ReactNode }) => {
  const [cohort, setCohort] = useState<Cohort>("Cohort 3");
  return (
    <AdminCohortContext.Provider value={{ cohort, setCohort }}>
      {children}
    </AdminCohortContext.Provider>
  );
};

export const useAdminCohort = () => {
  const ctx = useContext(AdminCohortContext);
  if (!ctx) throw new Error("useAdminCohort must be used within AdminCohortProvider");
  return ctx;
};
