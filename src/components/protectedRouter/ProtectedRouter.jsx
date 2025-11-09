import { useContext, useEffect, useState, memo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingBase from "../loading/LoadingBase";
import { AuthContext } from "../../context/AuthContext";

export default memo(function ProtectedRouter() {
  const { user, loading, socket } = useContext(AuthContext);
  const [delayDone, setDelayDone] = useState(false);


  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setDelayDone(true), 500); 
      return () => clearTimeout(timer);
    }
  }, [loading]);


  if (loading || !delayDone) {
    return <LoadingBase />;
  }

  if (!user || !socket) {
    return <Navigate to="/login" replace />;
  }


  return <Outlet />;
});
