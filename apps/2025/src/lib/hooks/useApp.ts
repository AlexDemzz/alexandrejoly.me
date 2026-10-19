import { useContext } from "react";
import { AppContext, AppContextValue } from "@/lib/Providers/AppProvider";

const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default useApp;
