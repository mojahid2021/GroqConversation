import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Check, Star, Medal, Trophy, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

interface BadgeProgressProps {
  userId: number;
}

// Define types for our data structures
interface BadgeData {
  id: number;
  name: string;
  description: string;
  criteria: string;
  threshold: number;
}

interface AchievementData {
  id: number;
  userId: number;
  type: string;
  count: number;
}

interface UserBadgeData {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
}

export function BadgeProgress({ userId }: BadgeProgressProps) {
  // Fetch badges
  const { data: badges, isLoading: badgesLoading } = useQuery<BadgeData[]>({
    queryKey: ['/api/badges'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/badges');
        return response as BadgeData[];
      } catch (error) {
        console.error('Error fetching badges:', error);
        return [];
      }
    }
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<AchievementData[]>({
    queryKey: ['/api/achievements'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/achievements');
        return response as AchievementData[];
      } catch (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }
    }
  });

  // Fetch user badges
  const { data: userBadges, isLoading: userBadgesLoading } = useQuery<UserBadgeData[]>({
    queryKey: ['/api/user-badges'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/user-badges');
        return response as UserBadgeData[];
      } catch (error) {
        console.error('Error fetching user badges:', error);
        return [];
      }
    }
  });

  const isLoading = badgesLoading || achievementsLoading || userBadgesLoading;

  // Define achievement categories
  const categories = [
    { id: 'messages', name: 'Messages', icon: <Zap className="h-5 w-5 text-yellow-500" /> },
    { id: 'documents', name: 'Documents', icon: <Medal className="h-5 w-5 text-green-500" /> },
    { id: 'conversations', name: 'Conversations', icon: <Trophy className="h-5 w-5 text-blue-500" /> },
    { id: 'webhooks', name: 'Webhooks', icon: <Star className="h-5 w-5 text-purple-500" /> },
    { id: 'api_keys', name: 'API Keys', icon: <Award className="h-5 w-5 text-red-500" /> }
  ];

  // Group badges by category
  const getBadgesByCategory = (categoryId: string): BadgeData[] => {
    if (!badges) return [];
    return badges
      .filter(badge => badge.criteria === categoryId)
      .sort((a, b) => a.threshold - b.threshold);
  };

  // Get achievement count for category
  const getAchievementCount = (categoryId: string): number => {
    if (!achievements) return 0;
    const achievement = achievements.find(a => a.type === categoryId);
    return achievement ? achievement.count : 0;
  };

  // Check if user has badge
  const hasUserBadge = (badgeId: number): boolean => {
    if (!userBadges) return false;
    return userBadges.some(ub => ub.badgeId === badgeId);
  };

  // Get next badge threshold
  const getNextBadgeThreshold = (categoryId: string, currentCount: number): number => {
    const categoryBadges = getBadgesByCategory(categoryId);
    const nextBadge = categoryBadges.find(badge => badge.threshold > currentCount);
    return nextBadge ? nextBadge.threshold : currentCount;
  };

  // Calculate progress percentage for category
  const calculateProgress = (categoryId: string): number => {
    const count = getAchievementCount(categoryId);
    const nextThreshold = getNextBadgeThreshold(categoryId, count);
    
    if (nextThreshold === count) return 100; // All badges earned
    if (count === 0) return 0;
    
    // Find the previous threshold to calculate progress between badges
    const categoryBadges = getBadgesByCategory(categoryId);
    const prevThreshold = categoryBadges
      .filter(badge => badge.threshold <= count)
      .sort((a, b) => b.threshold - a.threshold)[0]?.threshold || 0;
    
    // Calculate progress between previous and next threshold
    return Math.round((count - prevThreshold) / (nextThreshold - prevThreshold) * 100);
  };

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
            const count = getAchievementCount(category.id);
            const categoryBadges = getBadgesByCategory(category.id);
            const progress = calculateProgress(category.id);
            
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm">
                    {count} {category.name.toLowerCase()}
                  </span>
                </div>
                
                <Progress value={progress} className="h-2" />
                
                <div className="flex flex-wrap gap-3 mt-3">
                  {categoryBadges.map(badge => {
                    const earned = hasUserBadge(badge.id);
                    
                    return (
                      <div 
                        key={badge.id} 
                        className={`
                          flex flex-col items-center justify-center 
                          w-16 h-16 rounded-md border border-gray-200 p-2
                          ${earned ? 'bg-green-50' : 'bg-gray-50'}
                          relative
                        `}
                        title={`${badge.name}: ${badge.description} (${badge.threshold} ${category.name.toLowerCase()})`}
                      >
                        <div className="absolute -top-1 -right-1">
                          {earned && <Check className="h-4 w-4 bg-green-500 text-white rounded-full p-[2px]" />}
                        </div>
                        <Award className={`h-8 w-8 ${earned ? 'text-amber-500' : 'text-gray-400'}`} />
                        <span className="text-xs mt-1 text-center truncate w-full">
                          {earned ? badge.name : `At ${badge.threshold}`}
                        </span>
                      </div>
                    );
                  })}
                  
                  {categoryBadges.length === 0 && (
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