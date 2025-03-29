import { ReactNode, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, userId } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If not authenticated, show toast notification
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to login to access this area",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, toast]);

  // When authenticated but user ID is in localStorage but not in state
  // This helps with page refreshes
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!isAuthenticated && storedUserId) {
      // Force reload to re-initialize auth state
      window.location.reload();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}