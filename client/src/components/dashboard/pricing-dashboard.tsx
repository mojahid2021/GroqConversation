import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export function PricingDashboard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle>Model Pricing Information</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
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
      </CardContent>
    </Card>
  );
}