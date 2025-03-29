import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { PricingDashboard } from "@/components/dashboard/pricing-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsSummary, Analytics } from "@/lib/groq-api";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  
  // Query analytics data
  const { data: analyticsData, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics"],
  });

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Format cost
  const formatCost = (costInCents: number) => {
    const dollars = costInCents / 100;
    return `$${dollars.toFixed(2)}`;
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">Analytics</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <AnalyticsCards />
        <UsageChart className="mb-6" />
        
        <Tabs defaultValue="usage" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="usage">Usage Details</TabsTrigger>
            <TabsTrigger value="pricing">Model Pricing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage">
            <Card className="shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-gray-200">
                <CardTitle>Usage Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-12 text-gray-500">Loading usage data...</div>
                ) : analyticsData?.analytics.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No usage data available for the selected time period.</p>
                  </div>
                ) : (
                  <div className="scrollable max-h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Tokens Used</TableHead>
                          <TableHead>Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.analytics.map((item: Analytics) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.tokensUsed.toLocaleString()}</TableCell>
                            <TableCell>{formatCost(item.cost)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pricing">
            <PricingDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
