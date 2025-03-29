import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Check, Star, Medal, Trophy, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BadgeProgressProps {
  userId: number;
}

export function SimplifiedBadgeProgress({ userId }: BadgeProgressProps) {
  // Mock data for presentation purposes
  const isLoading = false;
  
  // Predefined categories
  const categories = [
    { id: 'messages', name: 'Messages', icon: <Zap className="h-5 w-5 text-yellow-500" />, count: 25, progress: 75 },
    { id: 'documents', name: 'Documents', icon: <Medal className="h-5 w-5 text-green-500" />, count: 5, progress: 50 },
    { id: 'conversations', name: 'Conversations', icon: <Trophy className="h-5 w-5 text-blue-500" />, count: 10, progress: 66 },
    { id: 'webhooks', name: 'Webhooks', icon: <Star className="h-5 w-5 text-purple-500" />, count: 2, progress: 40 },
    { id: 'api_keys', name: 'API Keys', icon: <Award className="h-5 w-5 text-red-500" />, count: 3, progress: 60 }
  ];

  // Predefined badges
  const categoryBadges = {
    messages: [
      { id: 1, name: 'Novice', description: 'Send your first message', threshold: 1, earned: true },
      { id: 2, name: 'Chatty', description: 'Send 10 messages', threshold: 10, earned: true },
      { id: 3, name: 'Communicator', description: 'Send 25 messages', threshold: 25, earned: true },
      { id: 4, name: 'Chat Master', description: 'Send 50 messages', threshold: 50, earned: false },
    ],
    documents: [
      { id: 5, name: 'Uploader', description: 'Upload your first document', threshold: 1, earned: true },
      { id: 6, name: 'Librarian', description: 'Upload 5 documents', threshold: 5, earned: true },
      { id: 7, name: 'Archivist', description: 'Upload 10 documents', threshold: 10, earned: false },
    ],
    conversations: [
      { id: 8, name: 'Starter', description: 'Start your first conversation', threshold: 1, earned: true },
      { id: 9, name: 'Discusser', description: 'Have 5 conversations', threshold: 5, earned: true },
      { id: 10, name: 'Conversationalist', description: 'Have 15 conversations', threshold: 15, earned: false },
    ],
    webhooks: [
      { id: 11, name: 'Connector', description: 'Create your first webhook', threshold: 1, earned: true },
      { id: 12, name: 'Integrator', description: 'Create 3 webhooks', threshold: 3, earned: false },
    ],
    api_keys: [
      { id: 13, name: 'Developer', description: 'Create your first API key', threshold: 1, earned: true },
      { id: 14, name: 'Programmer', description: 'Create 5 API keys', threshold: 5, earned: false },
    ]
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 text-amber-500 mr-2" />
          Achievement Progress
        </CardTitle>
        <CardDescription>
          Track your progress and earn badges as you use the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map(category => {
            const badges = categoryBadges[category.id as keyof typeof categoryBadges] || [];
            
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm">
                    {category.count} {category.name.toLowerCase()}
                  </span>
                </div>
                
                <Progress value={category.progress} className="h-2" />
                
                <div className="flex flex-wrap gap-3 mt-3">
                  {badges.map(badge => (
                    <div 
                      key={badge.id} 
                      className={`
                        flex flex-col items-center justify-center 
                        w-16 h-16 rounded-md border border-gray-200 p-2
                        ${badge.earned ? 'bg-green-50' : 'bg-gray-50'}
                        relative
                      `}
                      title={`${badge.name}: ${badge.description} (${badge.threshold} ${category.name.toLowerCase()})`}
                    >
                      <div className="absolute -top-1 -right-1">
                        {badge.earned && <Check className="h-4 w-4 bg-green-500 text-white rounded-full p-[2px]" />}
                      </div>
                      <Award className={`h-8 w-8 ${badge.earned ? 'text-amber-500' : 'text-gray-400'}`} />
                      <span className="text-xs mt-1 text-center truncate w-full">
                        {badge.earned ? badge.name : `At ${badge.threshold}`}
                      </span>
                    </div>
                  ))}
                  
                  {badges.length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      No badges available for this category yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}