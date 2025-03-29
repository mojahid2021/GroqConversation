import { useState, useEffect, useRef } from "react";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Search, 
  File, 
  MessageSquare, 
  Settings, 
  History, 
  Clock, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import Fuse from "fuse.js";

interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'conversation' | 'setting' | 'recent';
  url: string;
  icon: React.ReactNode;
  description?: string;
  keywords?: string[];
}

const mockSearchItems: SearchResult[] = [
  {
    id: 'docs-1',
    title: 'PDF Document Management',
    type: 'document',
    url: '/documents',
    icon: <File className="h-4 w-4 text-blue-500" />,
    description: 'Upload and manage PDF documents for AI processing',
    keywords: ['pdf', 'upload', 'documents', 'files']
  },
  {
    id: 'chat-1',
    title: 'Chat Interface',
    type: 'conversation',
    url: '/chat',
    icon: <MessageSquare className="h-4 w-4 text-green-500" />,
    description: 'Chat with AI using your documents as context',
    keywords: ['chat', 'conversation', 'message', 'talk']
  },
  {
    id: 'settings-1',
    title: 'API Settings',
    type: 'setting',
    url: '/settings',
    icon: <Settings className="h-4 w-4 text-gray-500" />,
    description: 'Configure your Groq API settings',
    keywords: ['api', 'config', 'settings', 'keys']
  },
  {
    id: 'settings-2',
    title: 'Profile Settings',
    type: 'setting',
    url: '/profile',
    icon: <Settings className="h-4 w-4 text-gray-500" />,
    description: 'Manage your profile and preferences',
    keywords: ['profile', 'account', 'user', 'settings']
  },
];

export function SmartSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize Fuse for fuzzy searching
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'description', weight: 0.3 },
      { name: 'keywords', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true
  };
  const fuse = new Fuse(mockSearchItems, fuseOptions);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const newRecentSearches = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5); // Keep only the 5 most recent searches
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };
  
  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = fuse.search(searchQuery)
      .map(result => result.item)
      .slice(0, 10); // Limit to 10 results
    
    setSearchResults(results);
  }, [searchQuery]);
  
  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen(prevOpen => !prevOpen);
      }
    };
    
    document.addEventListener('keydown', down);
    
    return () => {
      document.removeEventListener('keydown', down);
    };
  }, []);
  
  // Handle item selection
  const handleSelect = (item: SearchResult) => {
    saveRecentSearch(item.title);
    navigate(item.url);
    setOpen(false);
    setSearchQuery("");
    
    toast({
      title: "Navigating to " + item.title,
      description: "Directing you to the requested page",
    });
  };
  
  // Handle recent search selection
  const handleRecentSelect = (query: string) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
  };
  
  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    
    toast({
      title: "Recent searches cleared",
      description: "Your search history has been deleted",
    });
  };
  
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="inline-flex items-center">
          <Search className="mr-2 h-4 w-4" />
          <span>Search...</span>
        </div>
        <kbd className="pointer-events-none ml-4 inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col overflow-hidden rounded-md">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="border-b border-gray-200 px-3">
              <CommandInput 
                ref={searchInputRef}
                placeholder="Type a command or search..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
            </div>
            <CommandList className="max-h-[400px] overflow-y-auto">
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Sparkles className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="mb-1 text-sm font-medium">No results found</p>
                  <p className="text-xs text-gray-500">
                    Try searching for documents, conversations, or settings
                  </p>
                </div>
              </CommandEmpty>
              
              {!searchQuery && recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((query, index) => (
                    <CommandItem
                      key={`recent-${index}`}
                      onSelect={() => handleRecentSelect(query)}
                    >
                      <History className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{query}</span>
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={clearRecentSearches}
                    className="text-sm text-red-500 hover:text-red-600 justify-center"
                  >
                    Clear recent searches
                  </CommandItem>
                </CommandGroup>
              )}
              
              {searchResults.length > 0 && (
                <CommandGroup heading="Search Results">
                  {searchResults.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="flex items-start"
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <div className="ml-2">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              <CommandSeparator className="my-1" />
              
              <CommandGroup heading="Quick Links">
                <CommandItem onSelect={() => handleSelect(mockSearchItems[0])}>
                  <File className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Documents</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect(mockSearchItems[1])}>
                  <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
                  <span>Chat</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect(mockSearchItems[2])}>
                  <Settings className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Settings</span>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator className="my-1" />
              
              <div className="py-2 px-2">
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-1 rounded bg-gray-100">↑</kbd> <kbd className="px-1 rounded bg-gray-100">↓</kbd> to navigate, <kbd className="px-1 rounded bg-gray-100">Enter</kbd> to select, <kbd className="px-1 rounded bg-gray-100">Esc</kbd> to close
                </p>
              </div>
            </CommandList>
          </Command>
        </div>
      </CommandDialog>
    </>
  );
}