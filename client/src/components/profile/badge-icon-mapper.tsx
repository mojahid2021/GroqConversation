import React from 'react';
import { 
  Award, 
  MessageCircle, 
  MessageSquare, 
  FileText, 
  Key, 
  ExternalLink, 
  Trophy,
  Star,
  Zap,
  Heart,
  User,
  Rocket,
  Crown,
  Briefcase
} from 'lucide-react';

// Map badge icons (stored as strings in the database) to actual components
export const iconMap: Record<string, React.ReactNode> = {
  // Kebab case format
  'award': <Award className="h-5 w-5 text-yellow-500" />,
  'message-circle': <MessageCircle className="h-5 w-5 text-green-500" />,
  'message-square': <MessageSquare className="h-5 w-5 text-blue-500" />,
  'file-text': <FileText className="h-5 w-5 text-amber-500" />,
  'key': <Key className="h-5 w-5 text-purple-500" />,
  'external-link': <ExternalLink className="h-5 w-5 text-rose-500" />,
  'trophy': <Trophy className="h-5 w-5 text-yellow-500" />,
  'star': <Star className="h-5 w-5 text-yellow-500" />,
  'zap': <Zap className="h-5 w-5 text-blue-500" />,
  'heart': <Heart className="h-5 w-5 text-red-500" />,
  'user': <User className="h-5 w-5 text-slate-500" />,
  'rocket': <Rocket className="h-5 w-5 text-cyan-500" />,
  'crown': <Crown className="h-5 w-5 text-yellow-500" />,
  'briefcase': <Briefcase className="h-5 w-5 text-indigo-500" />,
  
  // PascalCase format for backward compatibility
  'MessageSquare': <MessageSquare className="h-5 w-5" />,
  'MessageCircle': <MessageCircle className="h-5 w-5" />,
  'FileText': <FileText className="h-5 w-5" />,
  'Key': <Key className="h-5 w-5" />,
  'Webhook': <ExternalLink className="h-5 w-5" />,
};

// Map of achievement types to their icons and labels
export const achievementInfo: Record<string, { icon: React.ReactNode, label: string }> = {
  conversations: { 
    icon: <MessageSquare className="h-5 w-5 text-blue-500" />, 
    label: 'Conversations' 
  },
  messages: { 
    icon: <MessageCircle className="h-5 w-5 text-green-500" />, 
    label: 'Messages Sent' 
  },
  documents: { 
    icon: <FileText className="h-5 w-5 text-amber-500" />, 
    label: 'Documents Uploaded' 
  },
  api_keys: { 
    icon: <Key className="h-5 w-5 text-purple-500" />, 
    label: 'API Keys Created' 
  },
  webhooks: { 
    icon: <ExternalLink className="h-5 w-5 text-rose-500" />, 
    label: 'Webhooks Configured' 
  },
};