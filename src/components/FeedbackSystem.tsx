import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Feedback = Tables<"feedback">;
type BadgeVariant = "default" | "destructive" | "secondary" | "outline";

const FeedbackSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState({
    feedback_type: "",
    subject: "",
    description: "",
    priority: "medium",
    rating: 0
  });

  const feedbackTypes = [
    { id: "suggestion", name: "Suggestion", description: "Ideas for improvement" },
    { id: "complaint", name: "Complaint", description: "Report issues or problems" },
    { id: "compliment", name: "Compliment", description: "Positive feedback" },
    { id: "bug_report", name: "Bug Report", description: "Technical issues" },
    { id: "feature_request", name: "Feature Request", description: "Request new features" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "secondary" as BadgeVariant },
    { value: "medium", label: "Medium", color: "default" as BadgeVariant },
    { value: "high", label: "High", color: "destructive" as BadgeVariant }
  ];

  useEffect(() => {
    if (user) {
      fetchFeedback();
    }
  }, [user]);

  const fetchFeedback = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your feedback history",
          variant: "destructive",
        });
        return;
      }

      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to submit feedback",
        variant: "destructive",
      });
      return;
    }

    if (!newFeedback.feedback_type || !newFeedback.subject || !newFeedback.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feedback_type: newFeedback.feedback_type,
          subject: newFeedback.subject,
          description: newFeedback.description,
          priority: newFeedback.priority,
          rating: newFeedback.rating > 0 ? newFeedback.rating : null,
          status: 'under_review'
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Thank you for your feedback! We'll review it soon.",
      });

      // Reset form
      setNewFeedback({
        feedback_type: "",
        subject: "",
        description: "",
        priority: "medium",
        rating: 0
      });

      // Refresh feedback list
      fetchFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_review':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string): BadgeVariant => {
    switch (status) {
      case 'under_review':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'under_review':
        return 'Under Review';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status.replace('_', ' ');
    }
  };

  const getPriorityColor = (priority: string): BadgeVariant => {
    const priorityItem = priorities.find(p => p.value === priority);
    return priorityItem?.color || 'default';
  };

  const getPriorityLabel = (priority: string): string => {
    const priorityItem = priorities.find(p => p.value === priority);
    return priorityItem?.label || priority;
  };

  const getFeedbackTypeName = (type: string): string => {
    const feedbackType = feedbackTypes.find(t => t.id === type);
    return feedbackType?.name || type.replace('_', ' ');
  };

  const renderStarRating = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            }`}
            onClick={interactive ? () => setNewFeedback({...newFeedback, rating: star}) : undefined}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Student Feedback</h1>
        <p className="text-muted-foreground">
          Help us improve your campus experience. Share your suggestions, report issues, or give us compliments!
        </p>
      </div>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">My Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Feedback Type <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={newFeedback.feedback_type} 
                    onValueChange={(value) => setNewFeedback({...newFeedback, feedback_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What type of feedback?" />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{type.name}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
                  <Select 
                    value={newFeedback.priority} 
                    onValueChange={(value) => setNewFeedback({...newFeedback, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              priority.value === 'high' ? 'bg-red-500' :
                              priority.value === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={newFeedback.subject}
                  onChange={(e) => setNewFeedback({...newFeedback, subject: e.target.value})}
                  placeholder="Brief summary of your feedback..."
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium">
                  Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({...newFeedback, description: e.target.value})}
                  placeholder="Please provide as much detail as possible..."
                  className="min-h-32 resize-vertical"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Overall Rating (Optional)</Label>
                <div className="flex items-center gap-4">
                  {renderStarRating(newFeedback.rating, true)}
                  <span className="text-sm text-muted-foreground">
                    {newFeedback.rating > 0 ? `${newFeedback.rating} out of 5 stars` : 'Click stars to rate'}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleSubmitFeedback}
                disabled={!newFeedback.feedback_type || !newFeedback.subject || !newFeedback.description}
                className="w-full"
                size="lg"
              >
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>My Feedback History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base">{item.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getFeedbackTypeName(item.feedback_type)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(item.priority)}>
                            {getPriorityLabel(item.priority)}
                          </Badge>
                          <Badge variant={getStatusColor(item.status)} className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            {getStatusLabel(item.status)}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

                      {item.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-muted-foreground">Your rating:</span>
                          {renderStarRating(item.rating)}
                        </div>
                      )}

                      {item.response && (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <h5 className="font-medium text-sm text-blue-900">Administrator Response:</h5>
                          </div>
                          <p className="text-sm text-blue-800">{item.response}</p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Submitted on {new Date(item.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Feedback Submitted Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't submitted any feedback yet. Your feedback helps us improve the campus experience for everyone.
                    </p>
                    <Button onClick={() => document.querySelector('[data-value="submit"]')?.click()}>
                      Submit Your First Feedback
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackSystem;