import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/layout/protected-route";

// Pages
import Chat from "@/pages/chat";
import ChatConversation from "@/pages/chat/[id]";
import Documents from "@/pages/documents";
import Analytics from "@/pages/analytics";
import Webhooks from "@/pages/webhooks";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import PublicChat from "@/pages/public-chat";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={PublicChat} />
            <Route path="/admin/login" component={Login} />
            
            {/* Protected Admin Routes - exact path matching */}
            <Route path="/admin/chat/:id">
              {(params) => (
                <ProtectedRoute>
                  <ChatConversation />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/admin/chat">
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/documents">
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/analytics">
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/webhooks">
              <ProtectedRoute>
                <Webhooks />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/settings">
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </Route>
            
            {/* Default admin route */}
            <Route path="/admin">
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            </Route>
            
            {/* Catch-all Not Found Route */}
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
