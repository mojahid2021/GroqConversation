import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Groq model pricing information
interface ModelPricing {
  name: string;
  tokensPerSecond: number;
  inputPrice: number;
  outputPrice: number;
}

const groqModelPricing: ModelPricing[] = [
  {
    name: "DeepSeek R1 Distill Llama 70B",
    tokensPerSecond: 275,
    inputPrice: 0.75,
    outputPrice: 0.99
  },
  {
    name: "DeepSeek R1 Distill Qwen 32B 128k",
    tokensPerSecond: 140,
    inputPrice: 0.69,
    outputPrice: 0.69
  },
  {
    name: "Qwen 2.5 32B Instruct 128k",
    tokensPerSecond: 200,
    inputPrice: 0.79,
    outputPrice: 0.79
  },
  {
    name: "Qwen 2.5 Coder 32B Instruct 128k",
    tokensPerSecond: 390,
    inputPrice: 0.79,
    outputPrice: 0.79
  },
  {
    name: "Qwen QwQ 32B (Preview) 128k",
    tokensPerSecond: 400,
    inputPrice: 0.29,
    outputPrice: 0.39
  },
  {
    name: "Mistral Saba 24B",
    tokensPerSecond: 330,
    inputPrice: 0.79,
    outputPrice: 0.79
  },
  {
    name: "Llama 3.2 1B (Preview) 8k",
    tokensPerSecond: 3100,
    inputPrice: 0.04,
    outputPrice: 0.04
  },
  {
    name: "Llama 3.2 3B (Preview) 8k",
    tokensPerSecond: 1600,
    inputPrice: 0.06,
    outputPrice: 0.06
  },
  {
    name: "Llama 3.3 70B Versatile 128k",
    tokensPerSecond: 275,
    inputPrice: 0.59,
    outputPrice: 0.79
  },
  {
    name: "Llama 3.1 8B Instant 128k",
    tokensPerSecond: 750,
    inputPrice: 0.05,
    outputPrice: 0.08
  },
  {
    name: "Llama 3 70B 8k",
    tokensPerSecond: 330,
    inputPrice: 0.59,
    outputPrice: 0.79
  },
  {
    name: "Llama 3 8B 8k",
    tokensPerSecond: 1250,
    inputPrice: 0.05,
    outputPrice: 0.08
  },
  {
    name: "Gemma 2 9B 8k",
    tokensPerSecond: 500,
    inputPrice: 0.20,
    outputPrice: 0.20
  },
  {
    name: "Llama Guard 3 8B 8k",
    tokensPerSecond: 765,
    inputPrice: 0.20,
    outputPrice: 0.20
  },
  {
    name: "Llama 3.3 70B SpecDec 8k",
    tokensPerSecond: 1600,
    inputPrice: 0.59,
    outputPrice: 0.99
  }
];

function formatPrice(pricePerMillion: number): string {
  return `$${pricePerMillion.toFixed(2)} per 1M tokens`;
}

function formatTokensPerDollar(pricePerMillion: number): string {
  // Calculate tokens per dollar (1M tokens / price per 1M tokens)
  const tokensPerDollar = 1000000 / pricePerMillion;
  return `${Math.round(tokensPerDollar / 1000)}k tokens per $1`;
}

function ModelPricingTable() {
  return (
    <div className="scrollable max-h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Speed (tok/sec)</TableHead>
            <TableHead className="text-right">Input Price</TableHead>
            <TableHead className="text-right">Output Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groqModelPricing.map((model) => (
            <TableRow key={model.name}>
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell className="text-right">{model.tokensPerSecond}</TableCell>
              <TableCell className="text-right">
                <div>${model.inputPrice.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{formatTokensPerDollar(model.inputPrice)}</div>
              </TableCell>
              <TableCell className="text-right">
                <div>${model.outputPrice.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{formatTokensPerDollar(model.outputPrice)}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PricingCalculator() {
  const [selectedModel, setSelectedModel] = useState<string>(groqModelPricing[0].name);
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(1000);
  const [requestsPerDay, setRequestsPerDay] = useState<number>(100);
  
  // Find the selected model
  const model = groqModelPricing.find(m => m.name === selectedModel) || groqModelPricing[0];
  
  // Calculate costs
  const inputCostPerRequest = (inputTokens * model.inputPrice) / 1000000;
  const outputCostPerRequest = (outputTokens * model.outputPrice) / 1000000;
  const totalCostPerRequest = inputCostPerRequest + outputCostPerRequest;
  
  const dailyCost = totalCostPerRequest * requestsPerDay;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;
  
  // Calculate tokens processed
  const dailyTokens = (inputTokens + outputTokens) * requestsPerDay;
  const monthlyTokens = dailyTokens * 30;
  const yearlyTokens = dailyTokens * 365;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="model">Select Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {groqModelPricing.map(model => (
                  <SelectItem key={model.name} value={model.name}>{model.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="input-tokens">Input Tokens: {inputTokens.toLocaleString()}</Label>
            <Slider 
              id="input-tokens"
              min={100} 
              max={10000} 
              step={100} 
              value={[inputTokens]} 
              onValueChange={(values) => setInputTokens(values[0])} 
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="output-tokens">Output Tokens: {outputTokens.toLocaleString()}</Label>
            <Slider 
              id="output-tokens"
              min={100} 
              max={10000} 
              step={100} 
              value={[outputTokens]} 
              onValueChange={(values) => setOutputTokens(values[0])} 
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="requests-per-day">Requests Per Day: {requestsPerDay}</Label>
            <Slider 
              id="requests-per-day"
              min={1} 
              max={1000} 
              step={10} 
              value={[requestsPerDay]} 
              onValueChange={(values) => setRequestsPerDay(values[0])} 
              className="mt-2"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4 space-y-4">
          <div>
            <h3 className="font-medium text-md">Cost Per Request</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-sm">Input Cost:</div>
              <div className="text-sm font-medium">${inputCostPerRequest.toFixed(6)}</div>
              <div className="text-sm">Output Cost:</div>
              <div className="text-sm font-medium">${outputCostPerRequest.toFixed(6)}</div>
              <div className="text-sm font-medium">Total:</div>
              <div className="text-sm font-medium">${totalCostPerRequest.toFixed(6)}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-md">Estimated Costs</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-sm">Daily:</div>
              <div className="text-sm font-medium">${dailyCost.toFixed(2)}</div>
              <div className="text-sm">Monthly:</div>
              <div className="text-sm font-medium">${monthlyCost.toFixed(2)}</div>
              <div className="text-sm">Yearly:</div>
              <div className="text-sm font-medium">${yearlyCost.toFixed(2)}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-md">Tokens Processed</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-sm">Daily:</div>
              <div className="text-sm font-medium">{dailyTokens.toLocaleString()}</div>
              <div className="text-sm">Monthly:</div>
              <div className="text-sm font-medium">{monthlyTokens.toLocaleString()}</div>
              <div className="text-sm">Yearly:</div>
              <div className="text-sm font-medium">{yearlyTokens.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingDashboard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle>Pricing Information</CardTitle>
        <CardDescription>
          View model pricing and estimate your costs based on usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="pricing-table">
          <TabsList className="mb-6">
            <TabsTrigger value="pricing-table">Pricing Table</TabsTrigger>
            <TabsTrigger value="cost-calculator">Cost Calculator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing-table">
            <ModelPricingTable />
          </TabsContent>
          
          <TabsContent value="cost-calculator">
            <PricingCalculator />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}