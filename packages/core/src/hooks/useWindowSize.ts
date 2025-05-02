import { useLayoutEffect, useState } from "react";
import { Platform, Dimensions } from "react-native";

const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (Platform.OS === "web") {
      const handleSize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      handleSize();
      window.addEventListener("resize", handleSize);
      return () => window.removeEventListener("resize", handleSize);
    } else {
      // For React Native
      const { width, height } = Dimensions.get("window");
      setWindowSize({ width, height });

      const subscription = Dimensions.addEventListener("change", ({ window }) => {
        setWindowSize({ width: window.width, height: window.height });
      });

      return () => subscription.remove();
    }
  }, []);

	return windowSize;
};

export default useWindowSize;

