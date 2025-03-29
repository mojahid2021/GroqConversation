import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Chat from "@/pages/chat";
import ChatConversation from "@/pages/chat/[id]";
import Documents from "@/pages/documents";
import Analytics from "@/pages/analytics";
import Webhooks from "@/pages/webhooks";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={Chat} />
          <Route path="/chat" component={Chat} />
          <Route path="/chat/:id" component={ChatConversation} />
          <Route path="/documents" component={Documents} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/webhooks" component={Webhooks} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
