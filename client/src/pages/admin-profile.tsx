import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserAchievements } from '@/components/profile/user-achievements';
import { SimplifiedBadgeProgress } from '@/components/achievement/simplified-badge-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Settings, Lock, Shield } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminProfilePage() {
  const { userId, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  const userIdNumber = userId ? parseInt(userId, 10) : 0;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#805AD5]" />
                  Admin Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>User ID: {userId}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Admin Access</span>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Account Settings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="achievements" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="badge-progress">Badge Progress</TabsTrigger>
              </TabsList>
              <TabsContent value="achievements">
                <UserAchievements />
              </TabsContent>
              <TabsContent value="badge-progress">
                <SimplifiedBadgeProgress userId={userIdNumber} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}