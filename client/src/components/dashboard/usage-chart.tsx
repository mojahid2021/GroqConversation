import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsSummary, Analytics } from "@/lib/groq-api";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

interface UsageChartProps {
  className?: string;
}

export function UsageChart({ className }: UsageChartProps) {
  const { data: analyticsData, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics"],
  });

  // Prepare chart data
  const prepareChartData = () => {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, 29 - i);
      return {
        date: format(date, "MMM dd"),
        tokens: 0,
        cost: 0,
      };
    });

    // Map analytics data to dates
    if (analyticsData?.analytics) {
      analyticsData.analytics.forEach((item: Analytics) => {
        const date = format(new Date(item.date), "MMM dd");
        const dayIndex = last30Days.findIndex((day) => day.date === date);
        
        if (dayIndex !== -1) {
          last30Days[dayIndex].tokens += item.tokensUsed;
          last30Days[dayIndex].cost += item.cost / 100; // Convert cents to dollars
        }
      });
    }

    return last30Days;
  };

  const chartData = prepareChartData();

  return (
    <Card className={cn("shadow", className)}>
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle>Token Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="aspect-w-16 aspect-h-6 w-full h-64">
          {isLoading ? (
            <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#805AD5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#805AD5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F6AD55" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F6AD55" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(value) => value.split(' ')[1]}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'tokens') return [value.toLocaleString(), 'Tokens'];
                    if (name === 'cost') return [`$${parseFloat(value).toFixed(2)}`, 'Cost'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  name="Tokens"
                  stroke="#805AD5"
                  fillOpacity={1}
                  fill="url(#colorTokens)"
                  yAxisId="left"
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke="#F6AD55"
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  yAxisId="right"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
