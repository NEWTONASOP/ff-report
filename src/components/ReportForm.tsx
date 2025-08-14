import { useState } from "react";
import { Shield, Upload, AlertTriangle, User, Hash, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportFormProps {
  onReportSubmitted: () => void;
}

export const ReportForm = ({ onReportSubmitted }: ReportFormProps) => {
  const [formData, setFormData] = useState({
    ign: "",
    uid: "",
    hack_type: "",
    description: ""
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const hackTypes = [
    "aimbot",
    "wallhack",
    "speedhack",
    "autoshoot",
    "teleport",
    "god_mode",
    "unlimited_ammo",
    "other"
  ];

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload only images or videos.",
          variant: "destructive",
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
      }
      
      return isValidType && isValidSize;
    });

    if (files.length + validFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can only upload up to 5 files.",
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ign.trim() || !formData.uid.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in the player IGN and UID.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload files first
      const uploadedUrls: string[] = [];
      
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('proof-files')
            .upload(fileName, file);

          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('proof-files')
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrl);
          setUploadProgress(((i + 1) / files.length) * 100);
        }
      }

      // Create report with default values for optional fields
      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          ign: formData.ign.trim(),
          uid: formData.uid.trim(),
          hack_type: formData.hack_type || 'other',
          description: formData.description.trim() || 'No description provided',
          proof_urls: uploadedUrls,
          upvotes: 0,
          downvotes: 0
        });

      if (reportError) throw reportError;

      toast({
        title: "Report submitted successfully!",
        description: "Thank you for helping keep Free Fire fair. Your report will be reviewed by the community.",
      });

      // Reset form
      setFormData({
        ign: "",
        uid: "",
        hack_type: "",
        description: ""
      });
      setFiles([]);
      setUploadProgress(0);

      // Notify parent component
      onReportSubmitted();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error submitting report",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHackTypeColor = (hackType: string) => {
    const colors = {
      aimbot: "bg-red-500/20 text-red-400 border-red-500/30",
      wallhack: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      speedhack: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          autoshoot: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    teleport: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      god_mode: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      unlimited_ammo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[hackType as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <Card className="gaming-card relative overflow-hidden mb-3">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-300/5" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
                Submit Report
              </h2>
              <p className="text-xs text-muted-foreground">Help keep Free Fire fair by reporting suspicious players</p>
            </div>
          </div>

          {/* Progress Indicator */}
          {isSubmitting && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">
                  {uploadProgress > 0 ? "Uploading files..." : "Submitting report..."}
                </span>
                <span className="text-xs text-muted-foreground">
                  {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : "Processing..."}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Compact Form */}
      <Card className="gaming-card">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Player Information - Side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ign" className="text-foreground flex items-center space-x-2 text-sm">
                <User className="h-3 w-3" />
                <span>Player IGN *</span>
              </Label>
              <Input
                id="ign"
                value={formData.ign}
                onChange={(e) => setFormData(prev => ({ ...prev, ign: e.target.value }))}
                placeholder="Enter player's IGN"
                className="gaming-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="uid" className="text-foreground flex items-center space-x-2 text-sm">
                <Hash className="h-3 w-3" />
                <span>Player UID *</span>
              </Label>
              <Input
                id="uid"
                value={formData.uid}
                onChange={(e) => setFormData(prev => ({ ...prev, uid: e.target.value }))}
                placeholder="Enter player's UID"
                className="gaming-input"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Hack Type Selection */}
          <div className="space-y-1">
            <Label htmlFor="hack_type" className="text-foreground flex items-center space-x-2 text-sm">
              <FileText className="h-3 w-3" />
              <span>Hack Type (Optional)</span>
            </Label>
            <Select 
              value={formData.hack_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hack_type: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="gaming-input">
                <SelectValue placeholder="Select hack type (optional)" />
              </SelectTrigger>
              <SelectContent>
                {hackTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getHackTypeColor(type)}`}>
                        {getHackTypeLabel(type)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-foreground flex items-center space-x-2 text-sm">
              <FileText className="h-3 w-3" />
              <span>Description (Optional)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the hacking behavior you observed... (optional)"
              className="gaming-input min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what you observed. Include details like game mode, time, and specific actions.
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center space-x-2 text-sm">
              <Upload className="h-3 w-3" />
              <span>Proof (Images/Videos)</span>
              <Badge variant="outline" className="text-xs">
                Max 5 files • 10MB each
              </Badge>
            </Label>
            
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors duration-200">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-2">
                Upload images or videos as proof of hacking behavior
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Supported: JPG, PNG, GIF, MP4, MOV • Max: 10MB
              </p>
              
              <Input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isSubmitting || files.length >= 5}
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isSubmitting || files.length >= 5}
                className="border-primary/30 hover:bg-primary/10 text-xs"
                size="sm"
              >
                <Upload className="h-3 w-3 mr-1" />
                Choose Files
              </Button>
            </div>

            {/* File Preview */}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Selected files ({files.length}/5):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-muted rounded-lg p-2 border border-border hover:border-primary/30 transition-colors duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={isSubmitting}
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-destructive mb-1">Important Notice</p>
              <p className="text-destructive/80">
                False reports may result in community penalties. Only report confirmed hackers with valid proof. 
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gaming"
            size="lg"
            disabled={isSubmitting}
            className="w-full relative overflow-hidden"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Submitting Report...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};