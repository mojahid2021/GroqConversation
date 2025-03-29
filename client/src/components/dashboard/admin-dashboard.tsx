import { useState } from "react";
import { AnalyticsCards } from "./analytics-cards";
import { UsageChart } from "./usage-chart";
import { DocumentList } from "./document-list";
import { ApiKeyManagement } from "./api-key-management";
import { Button } from "@/components/ui/button";
import { Download, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  className?: string;
}

type Tab = "overview" | "api-keys" | "documents" | "webhooks" | "settings";

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-inter font-bold text-[#2D3748]">Dashboard</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="inline-flex items-center"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button
              onClick={() => setActiveTab("settings")}
              className="inline-flex items-center bg-[#805AD5] hover:bg-[#805AD5]/90"
              size="sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="flex space-x-6 mt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-1 py-2 text-sm",
              activeTab === "overview"
                ? "text-[#2D3748] border-b-2 border-[#805AD5] font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("api-keys")}
            className={cn(
              "px-1 py-2 text-sm",
              activeTab === "api-keys"
                ? "text-[#2D3748] border-b-2 border-[#805AD5] font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={cn(
              "px-1 py-2 text-sm",
              activeTab === "documents"
                ? "text-[#2D3748] border-b-2 border-[#805AD5] font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={cn(
              "px-1 py-2 text-sm",
              activeTab === "webhooks"
                ? "text-[#2D3748] border-b-2 border-[#805AD5] font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "px-1 py-2 text-sm",
              activeTab === "settings"
                ? "text-[#2D3748] border-b-2 border-[#805AD5] font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Settings
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <>
            <AnalyticsCards />
            <UsageChart className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocumentList compact />
              <ApiKeyManagement compact />
            </div>
          </>
        )}
        
        {activeTab === "api-keys" && (
          <ApiKeyManagement />
        )}
        
        {activeTab === "documents" && (
          <DocumentList />
        )}
        
        {activeTab === "webhooks" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-inter font-semibold text-lg mb-4">Webhook Management</h2>
            <p className="text-gray-500 text-sm">
              Configure webhooks to receive real-time notifications when AI responses are generated.
              Useful for CLI integrations and external systems.
            </p>
            {/* Webhook content would go here */}
          </div>
        )}
        
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-inter font-semibold text-lg mb-4">System Settings</h2>
            <p className="text-gray-500 text-sm">
              Configure your GroqChat settings, API keys, and preferences.
            </p>
            {/* Settings content would go here */}
          </div>
        )}
      </div>
    </div>
  );
}
