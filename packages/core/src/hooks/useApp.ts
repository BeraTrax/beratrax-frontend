import { useContext } from "react";
import { AppContext } from "core/src/context/AppProvider";

const useApp = () => {
  return useContext(AppContext);
};

export default useApp;
