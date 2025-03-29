import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Webhook, 
  createWebhook, 
  updateWebhook, 
  deleteWebhook 
} from "@/lib/groq-api";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";

export function WebhookManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  
  // Query webhooks
  const { data: webhooks, isLoading } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
  });
  
  // Create webhook mutation
  const { mutate: createWebhookMutation, isPending: isCreating } = useMutation({
    mutationFn: createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
      setIsDialogOpen(false);
      setWebhookName("");
      setWebhookUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create webhook",
        variant: "destructive",
      });
    },
  });
  
  // Update webhook mutation
  const { mutate: updateWebhookMutation } = useMutation({
    mutationFn: ({id, data}: {id: number, data: Partial<Webhook>}) => 
      updateWebhook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update webhook",
        variant: "destructive",
      });
    },
  });
  
  // Delete webhook mutation
  const { mutate: deleteWebhookMutation } = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete webhook",
        variant: "destructive",
      });
    },
  });
  
  // Handle creating a new webhook
  const handleCreateWebhook = () => {
    if (!webhookName.trim() || !webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Name and URL are required",
        variant: "destructive",
      });
      return;
    }
    
    // Simple URL validation
    try {
      new URL(webhookUrl);
    } catch (e) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    createWebhookMutation({
      name: webhookName,
      url: webhookUrl,
    });
  };
  
  // Handle toggling webhook status
  const handleToggleStatus = (webhook: Webhook) => {
    updateWebhookMutation({
      id: webhook.id,
      data: { active: !webhook.active }
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Webhook Management</CardTitle>
          <CardDescription className="mt-2">
            Configure webhooks to receive notifications when AI responses are generated.
            Useful for CLI integrations and external systems.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#805AD5] hover:bg-[#805AD5]/90">
              <Plus className="mr-2 h-4 w-4" /> Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Add a new webhook endpoint to receive AI response notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="webhook-name">Webhook Name</Label>
                <Input
                  id="webhook-name"
                  placeholder="CLI Integration"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://example.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  We'll send a POST request with the AI response to this URL.
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
                onClick={handleCreateWebhook}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Webhook"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading webhooks...</div>
        ) : webhooks?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No webhooks configured yet. Add a webhook to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks?.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{webhook.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">URL</span>
                    <div className="text-sm font-mono text-blue-600 break-all">{webhook.url}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Created on {formatDate(webhook.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`webhook-active-${webhook.id}`}
                      checked={webhook.active}
                      onCheckedChange={() => handleToggleStatus(webhook)}
                    />
                    <Label htmlFor={`webhook-active-${webhook.id}`} className="text-sm">
                      {webhook.active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => deleteWebhookMutation(webhook.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
