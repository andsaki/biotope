import { useState, useEffect } from "react";
import { LOADER_DISPLAY_DURATION } from "../constants";

export const useLoader = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, LOADER_DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return showLoader;
};
