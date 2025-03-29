import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { UserCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <MessageSquare className="h-6 w-6 text-[#805AD5]" />
              <span className="ml-2 text-xl font-bold text-gray-800">GroqChat</span>
            </a>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Link href="/">
            <a className={cn(
              "text-gray-600 hover:text-gray-900",
              location === "/" && "text-gray-900 font-medium"
            )}>
              Chat
            </a>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <a className={cn(
                  "text-gray-600 hover:text-gray-900",
                  location === "/profile" && "text-gray-900 font-medium"
                )}>
                  <span className="flex items-center">
                    <UserCircle className="h-5 w-5 mr-1" />
                    Profile
                  </span>
                </a>
              </Link>
              
              <Link href="/admin">
                <Button size="sm" variant="outline" className="border-[#805AD5] text-[#805AD5] hover:bg-[#805AD5] hover:text-white">
                  Admin Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/admin/login">
              <Button size="sm" variant="outline" className="border-[#805AD5] text-[#805AD5] hover:bg-[#805AD5] hover:text-white">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}