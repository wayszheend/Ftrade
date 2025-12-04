import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl font-bold text-primary">404</div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you're looking for. The page might have been moved or deleted.
            </p>
          </div>
          <div className="w-24 h-24 mx-auto opacity-50">
            <Leaf className="w-full h-full text-primary" />
          </div>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
