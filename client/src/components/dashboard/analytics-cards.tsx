import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, MessageSquare, DollarSign } from "lucide-react";
import { AnalyticsSummary } from "@/lib/groq-api";

export function AnalyticsCards() {
  const { data: analyticsData, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics"],
  });

  const summary = analyticsData?.summary;

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Generate a random percentage for demo (this would be calculated from real data)
  const getRandomPercentage = (min: number, max: number) => {
    return (min + Math.random() * (max - min)).toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Usage</p>
              <p className="text-3xl font-inter font-bold mt-1">
                {isLoading ? "..." : formatNumber(summary?.totalTokens || 0)}
              </p>
              <p className="text-sm font-medium text-[#48BB78] mt-1">
                +{getRandomPercentage(5, 15)}% <span className="text-gray-500">vs last month</span>
              </p>
            </div>
            <div className="bg-[#805AD5] bg-opacity-10 p-3 rounded-lg">
              <BarChart2 className="text-[#805AD5]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Tokens generated across all conversations</p>
        </CardContent>
      </Card>
      
      <Card className="shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Active Conversations</p>
              <p className="text-3xl font-inter font-bold mt-1">
                {isLoading ? "..." : formatNumber(analyticsData?.analytics.length || 0)}
              </p>
              <p className="text-sm font-medium text-[#48BB78] mt-1">
                +{getRandomPercentage(3, 10)}% <span className="text-gray-500">vs last month</span>
              </p>
            </div>
            <div className="bg-[#805AD5] bg-opacity-10 p-3 rounded-lg">
              <MessageSquare className="text-[#805AD5]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Conversations initiated in the last 30 days</p>
        </CardContent>
      </Card>
      
      <Card className="shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Cost</p>
              <p className="text-3xl font-inter font-bold mt-1">
                ${isLoading ? "..." : (summary?.totalCost || 0).toFixed(2)}
              </p>
              <p className="text-sm font-medium text-[#F6AD55] mt-1">
                +{getRandomPercentage(10, 20)}% <span className="text-gray-500">vs last month</span>
              </p>
            </div>
            <div className="bg-[#805AD5] bg-opacity-10 p-3 rounded-lg">
              <DollarSign className="text-[#805AD5]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Total API costs for the current billing period</p>
        </CardContent>
      </Card>
    </div>
  );
}
