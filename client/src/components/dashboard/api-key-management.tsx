import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ApiKey, createApiKey, updateApiKey, deleteApiKey } from "@/lib/groq-api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, MoreVertical, Copy, Check, X, EyeOff, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ApiKeyManagementProps {
  compact?: boolean;
  className?: string;
}

export function ApiKeyManagement({ compact = false, className }: ApiKeyManagementProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [copiedKey, setCopiedKey] = useState<number | null>(null);
  
  // Query API keys
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/api-keys"],
  });
  
  // Create API key mutation
  const { mutate: createApiKeyMutation, isPending: isCreating } = useMutation({
    mutationFn: createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Success",
        description: "API key created successfully",
      });
      setIsDialogOpen(false);
      setNewKeyName("");
      setNewKeyValue("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create API key",
        variant: "destructive",
      });
    },
  });
  
  // Update API key mutation
  const { mutate: updateApiKeyMutation } = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => 
      updateApiKey(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Success",
        description: "API key updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API key",
        variant: "destructive",
      });
    },
  });
  
  // Delete API key mutation
  const { mutate: deleteApiKeyMutation } = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete API key",
        variant: "destructive",
      });
    },
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };
  
  // Handle copying API key
  const handleCopyKey = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };
  
  // Handle creating a new API key
  const handleCreateKey = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      toast({
        title: "Error",
        description: "Name and key value are required",
        variant: "destructive",
      });
      return;
    }
    
    createApiKeyMutation({
      name: newKeyName,
      key: newKeyValue,
    });
  };

  // Handle toggling API key status
  const toggleKeyStatus = (id: number, currentStatus: boolean) => {
    updateApiKeyMutation({ id, active: !currentStatus });
  };

  return (
    <Card className={cn("shadow", className)}>
      <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <CardTitle>
          {compact ? "API Key Management" : "API Keys"}
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size={compact ? "sm" : "default"}
              className="bg-[#805AD5] hover:bg-[#805AD5]/90"
            >
              <Plus className="mr-1 h-4 w-4" /> New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Add a new API key for integrating with the Groq platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="Production Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key-value">API Key</Label>
                <Input
                  id="key-value"
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  type="password"
                />
                <p className="text-xs text-gray-500">
                  Enter your Groq API key. It will be securely stored.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#805AD5] hover:bg-[#805AD5]/90"
                onClick={handleCreateKey}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading API keys...</div>
        ) : apiKeys?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No API keys created yet</div>
        ) : (
          <div className="space-y-4">
            {apiKeys?.slice(0, compact ? 3 : undefined).map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{apiKey.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">Created on {formatDate(apiKey.createdAt)}</p>
                    {!compact && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 p-0 text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                      >
                        {copiedKey === apiKey.id ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        {copiedKey === apiKey.id ? "Copied" : "Copy"}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    apiKey.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {apiKey.active ? "Active" : "Inactive"}
                  </span>
                  {!compact && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => toggleKeyStatus(apiKey.id, apiKey.active)}
                        >
                          {apiKey.active ? (
                            <X className="mr-2 h-4 w-4" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          {apiKey.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy key
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteApiKeyMutation(apiKey.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
