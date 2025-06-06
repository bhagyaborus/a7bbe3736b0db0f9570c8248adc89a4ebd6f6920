import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, X } from "lucide-react";

interface Post {
  id: number;
  content: string;
  status: string;
  createdAt: string;
}

interface PostApprovalProps {
  post: Post;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export default function PostApproval({ 
  post, 
  onApprove, 
  onReject, 
  isApproving, 
  isRejecting 
}: PostApprovalProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-medium text-slate-900">LinkedIn Post Draft</p>
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          </div>
          <p className="text-xs text-slate-500">Generated {formatTimeAgo(post.createdAt)}</p>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
        {post.content}
      </p>
      
      <div className="flex items-center space-x-2">
        <Button 
          onClick={onApprove}
          disabled={isApproving || isRejecting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          size="sm"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {isApproving ? "Approving..." : "Approve"}
        </Button>
        <Button 
          onClick={onReject}
          disabled={isApproving || isRejecting}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          <X className="w-4 h-4 mr-1" />
          {isRejecting ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
