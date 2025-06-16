import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const current = sessionStorage.getItem("currentPath");
    if (current) {
      sessionStorage.setItem("prevPath", current);
    }
    sessionStorage.setItem("currentPath", location.pathname);
  }, [location]);

  return null;
}

export default RouteTracker;