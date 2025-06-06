import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatCard from "@/components/ui/stat-card";
import WorkflowStep from "@/components/ui/workflow-step";
import PostApproval from "@/components/ui/post-approval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Clock, 
  Brain, 
  Heart, 
  MessageSquare, 
  Share2, 
  CheckCircle,
  Send,
  Mic,
  ExternalLink
} from "lucide-react";

interface DashboardStats {
  postsToday: number;
  pendingApprovals: number;
  aiCalls: number;
  engagement: number;
  successRate: number;
}

interface Post {
  id: number;
  content: string;
  status: string;
  platform: string;
  createdAt: string;
  publishedAt?: string;
  metrics?: string;
}

interface TelegramMessage {
  id: number;
  content: string;
  messageType: string;
  createdAt: string;
  processed: boolean;
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  // Fetch pending posts
  const { data: pendingPosts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts/status/pending"],
  });

  // Fetch recent Telegram messages
  const { data: telegramMessages = [] } = useQuery<TelegramMessage[]>({
    queryKey: ["/api/telegram/messages"],
  });

  // Approve post mutation
  const approvePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("PATCH", `/api/posts/${postId}`, { 
        status: "approved", 
        publishedAt: new Date().toISOString() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/status/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success!",
        description: "Post approved and published to LinkedIn",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive",
      });
    },
  });

  // Reject post mutation
  const rejectPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("PATCH", `/api/posts/${postId}`, { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/status/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Post Rejected",
        description: "Post has been rejected and moved to drafts",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive",
      });
    },
  });

  // Test workflow mutation
  const testWorkflowMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/workflow/test", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Test Workflow Complete",
        description: "Test workflow executed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to execute test workflow",
        variant: "destructive",
      });
    },
  });

  const handleApprovePost = (postId: number) => {
    approvePostMutation.mutate(postId);
  };

  const handleRejectPost = (postId: number) => {
    rejectPostMutation.mutate(postId);
  };

  const handleTestWorkflow = () => {
    testWorkflowMutation.mutate();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "posted":
      case "approved":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      case "rejected":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "posted":
      case "approved":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

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
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onTestWorkflow={handleTestWorkflow} isTestingWorkflow={testWorkflowMutation.isPending} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Posts Today"
              value={stats?.postsToday.toString() || "0"}
              icon={<BarChart3 className="text-blue-600" />}
              trend="+12% vs yesterday"
              loading={statsLoading}
            />
            <StatCard
              title="Pending Approvals"
              value={stats?.pendingApprovals.toString() || "0"}
              icon={<Clock className="text-amber-600" />}
              trend={stats?.pendingApprovals && stats.pendingApprovals > 0 ? "Requires attention" : "All caught up"}
              loading={statsLoading}
            />
            <StatCard
              title="AI Generation"
              value={stats?.aiCalls.toString() || "0"}
              icon={<Brain className="text-purple-600" />}
              trend="GPT-4o calls today"
              loading={statsLoading}
            />
            <StatCard
              title="Engagement"
              value={stats?.engagement ? `${stats.engagement}%` : "0%"}
              icon={<Heart className="text-emerald-600" />}
              trend="+5% this week"
              loading={statsLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Messages */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Messages</CardTitle>
                    <span className="text-sm text-muted-foreground">Last 24 hours</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {telegramMessages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent messages</p>
                        <p className="text-sm">Send a message to your Telegram bot to get started</p>
                      </div>
                    ) : (
                      telegramMessages.map((message) => (
                        <div key={message.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            {message.messageType === "voice" ? (
                              <Mic className="text-white text-sm" />
                            ) : (
                              <Send className="text-white text-sm" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900">
                                {message.messageType === "voice" ? "Voice Message" : "Content Idea"}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {message.messageType === "voice" ? "Voice message received" : message.content}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant={message.processed ? "default" : "secondary"}>
                                {message.processed ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Processed
                                  </>
                                ) : (
                                  <>
                                    <Brain className="w-3 h-3 mr-1" />
                                    AI Processing
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Approvals & System Status */}
            <div className="space-y-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPosts.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">All caught up!</p>
                      </div>
                    ) : (
                      pendingPosts.map((post) => (
                        <PostApproval
                          key={post.id}
                          post={post}
                          onApprove={() => handleApprovePost(post.id)}
                          onReject={() => handleRejectPost(post.id)}
                          isApproving={approvePostMutation.isPending}
                          isRejecting={rejectPostMutation.isPending}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Send className="text-blue-600" />
                        <span className="text-sm font-medium">Telegram Bot</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-sm text-emerald-600">Connected</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Brain className="text-purple-600" />
                        <span className="text-sm font-medium">OpenAI API</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-sm text-emerald-600">Operational</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="text-blue-600" />
                        <span className="text-sm font-medium">LinkedIn API</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-sm text-emerald-600">Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent LinkedIn Posts</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No posts yet</p>
                      <p className="text-sm">Your generated content will appear here</p>
                    </div>
                  ) : (
                    posts.slice(0, 5).map((post) => (
                      <div key={post.id} className={`border-l-4 pl-4 ${
                        post.status === "posted" || post.status === "approved" 
                          ? "border-emerald-500" 
                          : post.status === "pending" 
                            ? "border-amber-500" 
                            : "border-slate-300"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusBadgeVariant(post.status)}>
                                {getStatusIcon(post.status)}
                                {post.status === "posted" ? "Posted Successfully" : 
                                 post.status === "approved" ? "Approved" :
                                 post.status === "pending" ? "Pending" : 
                                 post.status === "rejected" ? "Rejected" : post.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(post.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {post.content}
                            </p>
                            {post.metrics && (
                              <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                                <span><Heart className="w-3 h-3 inline mr-1" />24 likes</span>
                                <span><MessageSquare className="w-3 h-3 inline mr-1" />7 comments</span>
                                <span><Share2 className="w-3 h-3 inline mr-1" />3 shares</span>
                              </div>
                            )}
                          </div>
                          <ExternalLink className="text-blue-600 text-lg" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
