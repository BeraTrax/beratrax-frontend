import { useContext } from "react";
import { AppContext } from "@core/context/AppProvider";

const useApp = () => {
  return useContext(AppContext);
};

export default useApp;
