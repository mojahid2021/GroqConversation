import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressDuration?: number;
  count?: number;
}

export function Skeleton({
  className,
  showProgress = false,
  progressValue,
  progressDuration = 2000,
  count = 1,
  ...props
}: SkeletonProps) {
  const [progress, setProgress] = useState(progressValue || 0);

  // Auto-increment progress if no specific value is provided
  useEffect(() => {
    if (showProgress && progressValue === undefined) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 1;
        });
      }, progressDuration / 100);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [showProgress, progressDuration, progressValue]);

  // Update progress when the prop changes
  useEffect(() => {
    if (progressValue !== undefined) {
      setProgress(progressValue);
    }
  }, [progressValue]);

  return (
    <div {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className={cn(
            "rounded-md bg-gray-200 animate-pulse dark:bg-gray-800",
            className
          )}
        />
      ))}
      
      {showProgress && (
        <div className="mt-2">
          <Progress value={progress} />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-40 w-full", className)}
      {...props}
    />
  );
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-4 w-full", className)}
      {...props}
    />
  );
}

export function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-12 w-12 rounded-full", className)}
      {...props}
    />
  );
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-10 w-24 rounded-md", className)}
      {...props}
    />
  );
}

export function SkeletonList({ 
  className, 
  count = 3, 
  showProgress = true,
  ...props 
}: SkeletonProps) {
  return (
    <div className="space-y-3">
      <SkeletonText count={count} className="h-4 w-full" />
      {showProgress && (
        <Progress value={50} className="mt-2" />
      )}
    </div>
  );
}

export function SkeletonDocument({ 
  className, 
  showProgress = true,
  ...props 
}: SkeletonProps) {
  return (
    <div className="space-y-5 rounded-md border border-gray-200 p-4">
      <SkeletonText className="h-6 w-2/3" />
      <SkeletonText className="h-4 w-full" count={3} />
      {showProgress && (
        <div className="mt-4">
          <Progress value={65} />
          <div className="mt-1 text-xs text-gray-500 text-right">
            Processing document...
          </div>
        </div>
      )}
    </div>
  );
}

export function SkeletonChat({ className, ...props }: SkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <SkeletonAvatar className="h-8 w-8" />
        <SkeletonText className="h-4 w-1/2" />
      </div>
      <div className="flex items-start space-x-3 justify-end">
        <SkeletonText className="h-4 w-1/3" />
        <SkeletonAvatar className="h-8 w-8 bg-purple-200" />
      </div>
      <div className="flex items-start space-x-3">
        <SkeletonAvatar className="h-8 w-8" />
        <div className="space-y-2 w-2/3">
          <SkeletonText className="h-4" />
          <SkeletonText className="h-4 w-5/6" />
          <SkeletonText className="h-4 w-4/6" />
        </div>
      </div>
      <Progress value={80} className="mt-2" />
    </div>
  );
}