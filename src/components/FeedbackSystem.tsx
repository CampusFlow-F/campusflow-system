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
        toast({
          title: "Error",
          description: "Failed to fetch feedback",
          variant: "destructive",
        });
        return;
      }

      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user || !newFeedback.feedback_type || !newFeedback.subject || !newFeedback.description) {
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
        toast({
          title: "Error",
          description: "Failed to submit feedback",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Feedback submitted successfully!",
      });

      // Reset form
      setNewFeedback({
        feedback_type: "",
        subject: "",
        description: "",
        priority: "medium",
        rating: 0
      });

      fetchFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string): BadgeVariant => {
    const priorityItem = priorities.find(p => p.value === priority);
    return priorityItem?.color || 'default';
  };

  const renderStarRating = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setNewFeedback({...newFeedback, rating: star}) : undefined}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">Feedback History</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Feedback Type</Label>
                  <Select value={newFeedback.feedback_type} onValueChange={(value) => setNewFeedback({...newFeedback, feedback_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newFeedback.priority} onValueChange={(value) => setNewFeedback({...newFeedback, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newFeedback.subject}
                  onChange={(e) => setNewFeedback({...newFeedback, subject: e.target.value})}
                  placeholder="Brief description of your feedback"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({...newFeedback, description: e.target.value})}
                  placeholder="Provide detailed information about your feedback..."
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Rating (Optional)</Label>
                <div className="flex items-center gap-2">
                  {renderStarRating(newFeedback.rating, true)}
                  <span className="text-sm text-muted-foreground">
                    {newFeedback.rating > 0 ? `${newFeedback.rating} out of 5 stars` : 'No rating'}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleSubmitFeedback}
                disabled={!newFeedback.feedback_type || !newFeedback.subject || !newFeedback.description}
                className="w-full"
              >
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{item.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {feedbackTypes.find(t => t.id === item.feedback_type)?.name || item.feedback_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge variant={getStatusColor(item.status)} className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm">{item.description}</p>

                      {item.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Your rating:</span>
                          {renderStarRating(item.rating)}
                        </div>
                      )}

                      {item.response && (
                        <div className="bg-muted p-3 rounded-md">
                          <h5 className="font-medium text-sm mb-1">Response:</h5>
                          <p className="text-sm">{item.response}</p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Submitted on {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
                    <p className="text-muted-foreground">
                      You haven't submitted any feedback yet. Use the "Submit Feedback" tab to get started.
                    </p>
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
