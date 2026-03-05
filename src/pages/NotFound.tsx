import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/"><Home className="mr-1 h-4 w-4" /> Home</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard"><LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
