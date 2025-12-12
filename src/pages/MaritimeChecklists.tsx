// PATCH UNIFY-9.0: Redirected to Maritime Command Center
import { useEffect } from "react";;;
import { useNavigate } from "react-router-dom";

export default function MaritimeChecklists() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/maritime-command", { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecionando para Maritime Command Center...</p>
      </div>
    </div>
  );
}
