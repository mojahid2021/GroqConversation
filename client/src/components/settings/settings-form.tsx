import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, updateSettings } from "@/lib/groq-api";
import { queryClient } from "@/lib/queryClient";
import { Save, Info } from "lucide-react";

export function SettingsForm() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("llama3-8b-8192");
  const [maxTokens, setMaxTokens] = useState(4096);
  const [temperature, setTemperature] = useState(70); // 0.7 * 100
  const [theme, setTheme] = useState("light");
  const [isFormChanged, setIsFormChanged] = useState(false);
  
  // Query settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });
  
  // Update settings on initial load
  useEffect(() => {
    if (settings) {
      setApiKey(settings.groqApiKey || "");
      setModel(settings.defaultModel);
      setMaxTokens(settings.maxTokens);
      setTemperature(settings.temperature);
      setTheme(settings.theme);
      setIsFormChanged(false);
    }
  }, [settings]);
  
  // Update form changed state when any setting changes
  useEffect(() => {
    if (settings) {
      const hasChanged = 
        apiKey !== (settings.groqApiKey || "") ||
        model !== settings.defaultModel ||
        maxTokens !== settings.maxTokens ||
        temperature !== settings.temperature ||
        theme !== settings.theme;
      
      setIsFormChanged(hasChanged);
    }
  }, [apiKey, model, maxTokens, temperature, theme, settings]);
  
  // Update settings mutation
  const { mutate: updateSettingsMutation, isPending } = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      setIsFormChanged(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    },
  });
  
  // Handle save settings
  const handleSaveSettings = () => {
    updateSettingsMutation({
      groqApiKey: apiKey,
      defaultModel: model,
      maxTokens: maxTokens,
      temperature: temperature,
      theme: theme,
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Configure your GroqChat settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading settings...</div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="api-key">Groq API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-sm text-gray-500">
                Your Groq API key. You can get one from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-[#805AD5]">console.groq.com</a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Default Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama3-8b-8192">Llama-3 8B</SelectItem>
                  <SelectItem value="llama3-70b-8192">Llama-3 70B</SelectItem>
                  <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                  <SelectItem value="gemma-7b-it">Gemma 7B</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                The AI model to use for conversations
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="max-tokens">Maximum Tokens</Label>
                <span className="text-sm text-gray-500">{maxTokens}</span>
              </div>
              <Slider
                id="max-tokens"
                min={256}
                max={8192}
                step={256}
                value={[maxTokens]}
                onValueChange={(values) => setMaxTokens(values[0])}
              />
              <p className="text-sm text-gray-500">
                Maximum number of tokens to generate in responses
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm text-gray-500">{(temperature / 100).toFixed(2)}</span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={100}
                step={5}
                value={[temperature]}
                onValueChange={(values) => setTemperature(values[0])}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>More precise</span>
                <span>More creative</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Controls randomness: lower values give more predictable outputs, higher values make output more random
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Application theme preference
              </p>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={!isFormChanged || isPending}
                className="bg-[#805AD5] hover:bg-[#805AD5]/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
