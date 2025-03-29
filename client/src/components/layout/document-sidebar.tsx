import { useState } from "react";
import { X, Upload, FileText, File, FileSpreadsheet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document, uploadDocument, deleteDocument } from "@/lib/groq-api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DocumentSidebarProps {
  className?: string;
  selectedDocumentIds: number[];
  onToggleDocument: (documentId: number) => void;
  onClose: () => void;
}

export function DocumentSidebar({ 
  className, 
  selectedDocumentIds, 
  onToggleDocument, 
  onClose 
}: DocumentSidebarProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  // Query documents
  const { data: documents, isLoading: isLoadingDocuments } = useQuery<Document[]>({ 
    queryKey: ['/api/documents']
  });
  
  // Upload document mutation
  const { mutate: uploadDocumentMutation } = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });
  
  // Delete document mutation
  const { mutate: deleteDocumentMutation } = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
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
  
  // Handle document upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Only PDF files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    uploadDocumentMutation(file);
    
    // Reset input
    event.target.value = '';
  };
  
  // Get document icon based on file type
  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="text-red-500" />;
    } else if (type.includes('word')) {
      return <File className="text-blue-500" />;
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
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
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div className={cn("w-80 bg-white border-l border-gray-200 h-full flex flex-col", className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-inter font-semibold text-lg text-[#2D3748]">Document Context</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label htmlFor="document-upload" className="w-full">
            <div className="inline-flex items-center justify-center w-full px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#805AD5] cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </div>
            <input
              id="document-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-3">
            {isLoadingDocuments ? (
              <div className="text-center py-4 text-gray-500">Loading documents...</div>
            ) : documents?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No documents uploaded yet</div>
            ) : (
              documents?.map((document) => (
                <div 
                  key={document.id} 
                  className={cn(
                    "border border-gray-200 rounded-lg p-3 transition-colors",
                    selectedDocumentIds.includes(document.id) 
                      ? "bg-gray-50" 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => onToggleDocument(document.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 rounded p-1">
                      {getDocumentIcon(document.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-800">{document.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatSize(document.size)} · Uploaded {formatDate(document.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocumentMutation(document.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedDocumentIds.includes(document.id) && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-600">Currently using in conversation</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
