import { createContext, useContext, useState, ReactNode } from "react";

type Cohort = "Cohort 1" | "Cohort 2";

interface AdminCohortContextType {
  cohort: Cohort;
  setCohort: (c: Cohort) => void;
}

const AdminCohortContext = createContext<AdminCohortContextType | undefined>(undefined);

export const AdminCohortProvider = ({ children }: { children: ReactNode }) => {
  const [cohort, setCohort] = useState<Cohort>("Cohort 2");
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
