import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Award, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { iconMap, achievementInfo } from './badge-icon-mapper';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  threshold: number;
  createdAt: string;
}

interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
  badge?: Badge;
}

interface Achievement {
  id: number;
  userId: number;
  type: string;
  count: number;
  updatedAt: string;
}

export function UserAchievements() {
  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    retry: false
  });

  // Fetch all possible badges
  const { data: allBadges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ['/api/badges'],
    retry: false,
  });

  // Fetch user badges
  const { data: userBadges, isLoading: userBadgesLoading } = useQuery<UserBadge[]>({
    queryKey: ['/api/user-badges'],
    retry: false
  });

  const isLoading = achievementsLoading || badgesLoading || userBadgesLoading;

  // Function to calculate progress towards a badge
  const calculateBadgeProgress = (badge: Badge) => {
    if (!achievements) return 0;
    
    const achievement = achievements.find(a => a.type === badge.criteria);
    if (!achievement) return 0;
    
    const progress = Math.min(achievement.count / badge.threshold * 100, 100);
    return progress;
  };

  // Function to check if a badge is earned
  const isBadgeEarned = (badgeId: number) => {
    if (!userBadges) return false;
    return userBadges.some(ub => ub.badge?.id === badgeId || ub.badgeId === badgeId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" /> 
            Achievements & Badges
          </CardTitle>
          <CardDescription>
            Track your progress and earn badges as you use the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading achievements...</div>
          ) : (
            <div className="space-y-6">
              {/* Earned Badges Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Earned Badges</h3>
                {userBadges && userBadges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userBadges.map((userBadge) => (
                      <Badge 
                        key={userBadge.id} 
                        variant="outline" 
                        className="py-2 px-3 flex items-center gap-2 bg-muted/50"
                      >
                        {userBadge.badge && iconMap[userBadge.badge.icon] || <Award className="h-4 w-4" />}
                        {userBadge.badge?.name || 'Unknown Badge'}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    You haven't earned any badges yet. Keep using the platform to unlock achievements!
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Available Badges Progress Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Badge Progress</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {allBadges && allBadges.map((badge) => {
                    const progress = calculateBadgeProgress(badge);
                    const earned = isBadgeEarned(badge.id);
                    
                    return (
                      <div 
                        key={badge.id} 
                        className={`p-4 border rounded-lg ${earned ? 'bg-muted/50 border-primary/30' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${earned ? 'bg-primary/20' : 'bg-muted'}`}>
                              {iconMap[badge.icon] || <Award className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="font-medium">{badge.name}</h4>
                              <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </div>
                          </div>
                          {earned && (
                            <Badge variant="secondary" className="text-xs">
                              Earned
                            </Badge>
                          )}
                        </div>
                        <Progress value={progress} className="h-2 mt-2" />
                        <p className="text-xs text-right mt-1 text-muted-foreground">
                          {`${Math.min(achievements?.find(a => a.type === badge.criteria)?.count || 0, badge.threshold)} / ${badge.threshold}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <Separator />
              
              {/* Achievement Statistics Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Achievement Statistics</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {achievements && achievements.map((achievement) => {
                    const info = achievementInfo[achievement.type] || {
                      icon: <Award className="h-5 w-5 text-gray-500" />,
                      label: achievement.type
                    };
                    
                    return (
                      <div key={achievement.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          {info.icon}
                          <h4 className="font-medium">{info.label}</h4>
                        </div>
                        <p className="text-2xl font-bold">{achievement.count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}