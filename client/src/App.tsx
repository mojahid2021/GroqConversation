import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { ScrollArea } from "@/components/ui/scroll-area";

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
import Profile from "@/pages/profile";
import AdminProfile from "@/pages/admin-profile";

function App() {
  // Wrapper component to add ScrollArea to all pages
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <ScrollArea className="page-container h-screen">
      <div className="px-4">
        {children}
      </div>
    </ScrollArea>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <div className="h-screen overflow-hidden">
            <Switch>
              {/* Public Routes */}
              <Route path="/">
                <PageWrapper>
                  <PublicChat />
                </PageWrapper>
              </Route>
              <Route path="/admin/login">
                <PageWrapper>
                  <Login />
                </PageWrapper>
              </Route>
              <Route path="/profile">
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              </Route>
              
              {/* Protected Admin Routes - exact path matching */}
              <Route path="/admin/chat/:id">
                {(params) => (
                  <ProtectedRoute>
                    <PageWrapper>
                      <ChatConversation />
                    </PageWrapper>
                  </ProtectedRoute>
                )}
              </Route>
              <Route path="/admin/chat">
                <ProtectedRoute>
                  <PageWrapper>
                    <Chat />
                  </PageWrapper>
                </ProtectedRoute>
              </Route>
              <Route path="/admin/documents">
                <ProtectedRoute>
                  <PageWrapper>
                    <Documents />
                  </PageWrapper>
                </ProtectedRoute>
              </Route>
              <Route path="/admin/analytics">
                <ProtectedRoute>
                  <PageWrapper>
                    <Analytics />
                  </PageWrapper>
                </ProtectedRoute>
              </Route>
              <Route path="/admin/webhooks">
                <ProtectedRoute>
                  <PageWrapper>
                    <Webhooks />
                  </PageWrapper>
                </ProtectedRoute>
              </Route>
              <Route path="/admin/settings">
                <ProtectedRoute>
                  <PageWrapper>
                    <Settings />
                  </PageWrapper>
                </ProtectedRoute>
              </Route>
              <Route path="/admin/profile">
                <ProtectedRoute>
                  <PageWrapper>
                    <AdminProfile />
                  </PageWrapper>
                </ProtectedRoute>
              </Route>
              
              {/* Default admin route */}
              <Route path="/admin">
                <ProtectedRoute>
                  <PageWrapper>
                    <Chat />
                  </PageWrapper>
                </ProtectedRoute>
              </Route>
              
              {/* Catch-all Not Found Route */}
              <Route>
                <PageWrapper>
                  <NotFound />
                </PageWrapper>
              </Route>
            </Switch>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
