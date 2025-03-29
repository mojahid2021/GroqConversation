import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document, uploadDocument, deleteDocument } from "@/lib/groq-api";
import { queryClient } from "@/lib/queryClient";
import { FileText, File, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";

export default function Documents() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  // Query documents
  const { data: documents, isLoading } = useQuery<Document[]>({ 
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
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
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
      return <FileText className="text-red-500 h-5 w-5" />;
    } else if (type.includes('word')) {
      return <File className="text-blue-500 h-5 w-5" />;
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
      return <FileSpreadsheet className="text-green-500 h-5 w-5" />;
    } else {
      return <FileText className="text-gray-500 h-5 w-5" />;
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
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <MainLayout>
      <div className="p-6">
        <Card className="shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
            <CardTitle>Document Management</CardTitle>
            <label htmlFor="document-upload">
              <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#805AD5] hover:bg-[#805AD5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#805AD5] cursor-pointer">
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
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading documents...</div>
            ) : documents?.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
                <p className="text-gray-500">Upload PDF documents to use as context in your Groq AI conversations.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents?.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-red-100 p-2 rounded-md">
                            {getDocumentIcon(document.type)}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{document.name}</div>
                            <div className="text-sm text-gray-500">{document.type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatSize(document.size)}</TableCell>
                      <TableCell>{formatDate(document.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => deleteDocumentMutation(document.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
