import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document, deleteDocument } from "@/lib/groq-api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FileText, File, FileSpreadsheet, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface DocumentListProps {
  compact?: boolean;
  className?: string;
}

export function DocumentList({ compact = false, className }: DocumentListProps) {
  const { toast } = useToast();
  
  // Query documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  // Delete document mutation
  const { mutate: deleteDocumentMutation } = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    },
  });
  
  // Get document icon based on file type
  const getDocumentIcon = (type: string) => {
    if (type.includes("pdf")) {
      return <FileText className="text-red-500" />;
    } else if (type.includes("word")) {
      return <File className="text-blue-500" />;
    } else if (type.includes("excel") || type.includes("spreadsheet")) {
      return <FileSpreadsheet className="text-green-500" />;
    } else {
      return <FileText className="text-gray-500" />;
    }
  };
  
  // Format file size
  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, compact ? "MMM d, yyyy" : "MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <Card className={cn("shadow", className)}>
      <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <CardTitle>
          {compact ? "Recent Documents" : "Document Management"}
        </CardTitle>
        {compact && (
          <Button variant="link" size="sm" className="text-[#805AD5] hover:text-[#805AD5]/80">
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading documents...</div>
        ) : documents?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No documents uploaded yet</div>
        ) : (
          <div className="space-y-4">
            {documents?.slice(0, compact ? 3 : undefined).map((document) => (
              <div key={document.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded p-2">
                    {getDocumentIcon(document.type)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">{document.name}</h3>
                    <p className="text-xs text-gray-500">Uploaded {formatDate(document.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-500 mr-4">{formatSize(document.size)}</div>
                  {!compact && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => deleteDocumentMutation(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
