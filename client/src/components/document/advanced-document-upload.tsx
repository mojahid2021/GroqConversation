import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { uploadDocument } from "@/lib/groq-api";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  FileText,
  Upload,
  Image as ImageIcon,
  Layers,
  Info,
  CheckCircle2,
  FileQuestion,
  AlertCircle
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function to format file size
const formatSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

export function AdvancedDocumentUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  
  // Upload mutation
  const { mutate: uploadMutation } = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsProcessing(false);
      setScanProgress(100);
      setUploadProgress(100);
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been processed and is ready to use.",
      });
      
      // Reset form
      setFile(null);
      setDocumentPreview(null);
      setScanProgress(0);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    }
  });
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    processFile(selectedFile);
  };
  
  // Handle drag over event
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.add("border-purple-400", "bg-purple-50");
    }
  };
  
  // Handle drag leave event
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove("border-purple-400", "bg-purple-50");
    }
  };
  
  // Handle drop event
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove("border-purple-400", "bg-purple-50");
    }
    
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    
    processFile(files[0]);
  };
  
  // Process the selected file
  const processFile = (selectedFile: File) => {
    // Check file size (limit to 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // For PDF files
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setDocumentPreview(objectUrl);
      
      return;
    }
    
    // For image files (OCR processing)
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setDocumentPreview(objectUrl);
      
      return;
    }
    
    // Unsupported file type
    toast({
      title: "Unsupported file type",
      description: "Please upload a PDF or an image file (JPG, PNG)",
      variant: "destructive",
    });
  };
  
  // Handle upload button click
  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Scan progress timer
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 96) {
          return 96; // Don't stop the interval yet, but cap the visible progress
        }
        return prev + 2;
      });
    }, 100);
    
    // Upload progress timer - a bit slower than scan to simulate network upload
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 92) {
          return 92; // Cap the visible progress
        }
        return prev + 3;
      });
    }, 150);
    
    try {
      // Process the file with realistic timing that shows processing steps
      // Give a slight delay so UI shows some progress before upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt the actual upload
      await uploadMutation(file);
      
      // Set progress to 100% on success
      setScanProgress(100);
      setUploadProgress(100);
      
      // Clear intervals
      clearInterval(scanInterval);
      clearInterval(uploadInterval);
    } catch (error) {
      // Error handling with visual feedback
      clearInterval(scanInterval);
      clearInterval(uploadInterval);
      
      // Set progress to indicate failure
      setScanProgress(prev => Math.min(prev, 98));
      setUploadProgress(prev => Math.min(prev, 50));
      
      // Display error via toast (already handled in the mutation error callback)
      
      // Reset processing state but keep the file for retry
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload PDF documents or images to extract text and use as context in your AI conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">File Upload</TabsTrigger>
            <TabsTrigger value="info">About Document Processing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                ref={dragAreaRef}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200 ease-in-out hover:bg-gray-50 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                />
                
                <div className="flex flex-col items-center justify-center">
                  {!documentPreview ? (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Drag & Drop or Click to Upload
                      </h3>
                      <p className="text-sm text-gray-500">
                        Support for PDF, JPG, and PNG files (max 10MB)
                      </p>
                    </>
                  ) : file?.type === 'application/pdf' ? (
                    <div className="w-full flex items-center justify-center">
                      <div className="bg-red-50 p-6 rounded-lg flex flex-col items-center">
                        <FileText className="h-16 w-16 text-red-500 mb-2" />
                        <span className="text-sm font-medium text-gray-900 mt-2 truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatSize(file.size)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center">
                      <div className="rounded-lg flex flex-col items-center">
                        <img 
                          src={documentPreview} 
                          alt="Preview" 
                          className="h-[180px] object-contain rounded-lg border border-gray-200"
                        />
                        <span className="text-sm font-medium text-gray-900 mt-2 truncate max-w-[200px]">
                          {file?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {file ? formatSize(file.size) : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Processing Progress */}
              {isProcessing && (
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Document Scanning</Label>
                      <span className="text-xs text-gray-500">{Math.round(scanProgress)}%</span>
                    </div>
                    <Progress value={scanProgress} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Upload Progress</Label>
                      <span className="text-xs text-gray-500">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setDocumentPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={!file || isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || isProcessing}
                  className="bg-[#805AD5] hover:bg-[#805AD5]/90"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Upload Document"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <div className="space-y-6 p-1">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Layers className="h-6 w-6 text-[#805AD5]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Document Processing</h3>
                  <p className="text-gray-600 text-sm">
                    Documents are processed to extract text, which is then used as context for your AI conversations.
                    This helps the AI provide more accurate and personalized responses.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">PDF Documents</h3>
                  <p className="text-gray-600 text-sm">
                    PDF documents are processed to extract all text content. For best results, 
                    use PDFs with selectable text rather than scanned documents.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <ImageIcon className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Image OCR</h3>
                  <p className="text-gray-600 text-sm">
                    Images are processed using Optical Character Recognition (OCR) to extract text.
                    This works best with clear, high-resolution images of printed text.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Info className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Tips for Best Results</h3>
                  <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
                    <li>Use documents with clear, legible text</li>
                    <li>Prefer digital PDFs over scanned documents when possible</li>
                    <li>For images, ensure good lighting and high resolution</li>
                    <li>Avoid documents with heavy use of special characters or complex formatting</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Supported File Types */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Supported File Types</h4>
          <div className="flex flex-wrap gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center bg-red-50 rounded-md px-3 py-2">
                    <FileText className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm">PDF</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">PDF documents with selectable text</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center bg-blue-50 rounded-md px-3 py-2">
                    <ImageIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">JPG</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">JPEG images (with OCR processing)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center bg-green-50 rounded-md px-3 py-2">
                    <ImageIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">PNG</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">PNG images (with OCR processing)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}