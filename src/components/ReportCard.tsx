import { useState } from "react";
import { Eye, AlertTriangle, User, Hash, ThumbsUp, ThumbsDown, Clock, Play, Copy, Check, Shield, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  ign: string;
  uid: string;
  hack_type: string;
  description: string;
  proof_urls: string[];
  upvotes: number;
  downvotes: number;
  created_at: string;
}

interface ReportCardProps {
  report: Report;
  onUpdate: () => void;
}

export const ReportCard = ({ report, onUpdate }: ReportCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const { toast } = useToast();

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(report.uid);
      setCopiedUid(true);
      toast({
        title: "UID copied!",
        description: "Player UID has been copied to clipboard.",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedUid(false), 2000);
    } catch (error) {
      console.error('Failed to copy UID:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy UID to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    setIsVoting(true);
    try {
      // Simple fingerprinting (in real app, use more robust method)
      const userFingerprint = localStorage.getItem('user_fingerprint') || 
        Math.random().toString(36).substring(7);
      localStorage.setItem('user_fingerprint', userFingerprint);

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('report_id', report.id)
        .eq('user_fingerprint', userFingerprint)
        .single();

      if (existingVote) {
        // Update existing vote
        if (existingVote.vote_type !== voteType) {
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
          
          // Update report counts
          const upvoteChange = voteType === 'upvote' ? 1 : -1;
          const downvoteChange = voteType === 'downvote' ? 1 : -1;
          
          await supabase
            .from('reports')
            .update({
              upvotes: report.upvotes + upvoteChange,
              downvotes: report.downvotes + downvoteChange
            })
            .eq('id', report.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            report_id: report.id,
            user_fingerprint: userFingerprint,
            vote_type: voteType
          });

        // Update report counts
        const updateData = voteType === 'upvote' 
          ? { upvotes: report.upvotes + 1 }
          : { downvotes: report.downvotes + 1 };

        await supabase
          .from('reports')
          .update(updateData)
          .eq('id', report.id);
      }

      onUpdate();
      toast({
        title: "Vote recorded",
        description: `Your ${voteType} has been recorded.`,
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getVoteStatus = () => {
    const total = report.upvotes + report.downvotes;
    if (total === 0) return { upvoteRatio: 0, label: 'No votes yet', color: 'text-muted-foreground', barColor: 'bg-muted' };
    
    const upvoteRatio = report.upvotes / total;
    if (upvoteRatio >= 0.8) return { upvoteRatio, label: 'Highly Suspicious', color: 'text-red-400', barColor: 'bg-red-500' };
    if (upvoteRatio >= 0.6) return { upvoteRatio, label: 'Suspicious', color: 'text-orange-400', barColor: 'bg-orange-500' };
    if (upvoteRatio >= 0.4) return { upvoteRatio, label: 'Mixed', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
    return { upvoteRatio, label: 'Likely Safe', color: 'text-green-400', barColor: 'bg-green-500' };
  };

  const voteStatus = getVoteStatus();

  const isVideoFile = (url: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Simple labels for hack types
  const getHackTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      "aimbot": "Auto Aim",
      "wallhack": "See Through Walls",
      "speedhack": "Super Speed",
      "autoshoot": "Auto Shoot",
      "teleport": "Teleport",
      "god_mode": "God Mode",
      "unlimited_ammo": "Unlimited Ammo",
      "other": "Other"
    };
    return labels[type] || type;
  };

  return (
    <>
      <Card className="gaming-card hover:shadow-lg transition-all duration-300 group">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1 space-y-3">
            {/* Player Info - Stack on mobile, side by side on larger screens */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Player:</span>
                <span className="font-semibold text-foreground truncate">{report.ign}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">UID:</span>
                <span className="text-sm text-muted-foreground font-mono">{report.uid}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUid}
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  title="Copy UID to clipboard"
                >
                  {copiedUid ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Hack Type - Prominent display */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-muted-foreground">Hack Type:</span>
                <Badge className="hack-type-badge">
                  {getHackTypeLabel(report.hack_type)}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Vote Status */}
          <div className="text-center sm:text-right">
            <div className="mb-2">
              <div className={`text-sm font-medium ${voteStatus.color}`}>
                {voteStatus.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {report.upvotes} up • {report.downvotes} down
              </div>
            </div>
            {/* Vote Bar */}
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${voteStatus.barColor} transition-all duration-300`}
                style={{ width: `${voteStatus.upvoteRatio * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed">{report.description}</p>
        </div>

        {/* Proof Section - Button instead of direct display */}
        {report.proof_urls.length > 0 && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProofModal(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 border-primary/30 hover:bg-primary/10"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm">View Proof ({report.proof_urls.length} file{report.proof_urls.length !== 1 ? 's' : ''})</span>
            </Button>
          </div>
        )}

        {/* Voting Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border">
          <div className="flex items-center justify-center sm:justify-start space-x-4">
            {/* Upvote Button - Player is suspicious */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('upvote')}
              disabled={isVoting}
              className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 flex-1 sm:flex-none"
              title="Upvote - Player is suspicious/hacker"
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="font-medium">{report.upvotes}</span>
              <span className="text-xs">Suspicious</span>
            </Button>

                        {/* Downvote Button - Player is safe */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('downvote')}
              disabled={isVoting}
              className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 text-green-400 hover:bg-green-500/10 hover:text-green-300 border border-green-500/20 hover:border-green-500/40 flex-1 sm:flex-none"
              title="Downvote - Player is safe/not a hacker"
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="font-medium">{report.downvotes}</span>
              <span className="text-xs">Safe</span>
            </Button>
          </div>

          {/* Report ID */}
          <div className="text-xs text-muted-foreground font-mono text-center sm:text-right">
            #{report.id.slice(-8)}
          </div>
        </div>

        {/* Enhanced Hover Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
      </Card>

      {/* Proof Modal */}
      <Dialog open={showProofModal} onOpenChange={setShowProofModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Proof Files - {report.ign}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Player: <span className="font-medium text-foreground">{report.ign}</span> (UID: {report.uid})</p>
              <p>Hack Type: <span className="font-medium text-foreground">{getHackTypeLabel(report.hack_type)}</span></p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.proof_urls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {isVideoFile(url) ? (
                      <video
                        src={url}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      >
                        <source src={url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={url}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => window.open(url, '_blank')}
                      />
                    )}
                    
                    {/* File type indicator */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {isVideoFile(url) ? (
                        <div className="flex items-center space-x-1">
                          <Play className="h-3 w-3" />
                          <span>Video</span>
                        </div>
                      ) : (
                        <span>Image</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Size
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};