import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { FileText, File, FileSpreadsheet, Trash2, Upload, List, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { AdvancedDocumentUpload } from "@/components/document/advanced-document-upload";
import { 
  SkeletonDocument,
  SkeletonCard
} from "@/components/ui/skeleton";

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

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <MainLayout>
      <div className="p-6">
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents">
            <Card className="shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                <CardTitle>Document Library</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-[#805AD5] hover:bg-[#805AD5]/90" : ""}
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-[#805AD5] hover:bg-[#805AD5]/90" : ""}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Grid
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {viewMode === "list" ? (
                      <div className="space-y-6">
                        <SkeletonDocument count={3} showProgress={true} />
                        <div className="flex items-center justify-center mt-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Loading documents...</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <SkeletonCard 
                              key={i} 
                              showProgress={i === 1 || i === 4} 
                              progressValue={i === 1 ? 65 : i === 4 ? 82 : undefined}
                              className="h-[160px]"
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-center mt-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Loading your document library...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : documents?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
                    <p className="text-gray-500">Upload PDF documents to use as context in your Groq AI conversations.</p>
                  </div>
                ) : viewMode === "list" ? (
                  <ScrollArea className="h-[600px]">
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
                  </ScrollArea>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents?.map((document) => (
                      <div 
                        key={document.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 p-3 rounded-md">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div className="ml-3 truncate">
                              <div className="font-medium truncate max-w-[200px]">{document.name}</div>
                              <div className="text-xs text-gray-500">{formatSize(document.size)}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => deleteDocumentMutation(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-auto pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            Uploaded on {format(new Date(document.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upload">
            <AdvancedDocumentUpload />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
