import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  AlertCircle,
  TrendingUp,
  Navigation,
  Bell,
  MessageSquare,
  FileText,
  User
} from "lucide-react";

interface UpcomingClass {
  id: string;
  start_time: string;
  end_time: string;
  subject: string;
  class: string;
  room: string;
  day_of_week: string;
  lecturer_id: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  class: string;
  submission_date: string;
  portal_open: boolean;
  created_at: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  class: string;
  subject: string;
  file_url: string;
  created_at: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  target_class: string;
  created_at: string;
}

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [studentClass, setStudentClass] = useState<string>("General");
  const [libraryCapacity, setLibraryCapacity] = useState({
    current: 0,
    total: 315,
    availableRooms: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      console.log("Fetching data for user:", user.id);

      // Get user profile to check role and get name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, department')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Could not load user profile");
        return;
      }

      if (profileData) {
        setUserName(profileData.full_name || "Student");
        
        // If user is a lecturer, redirect or show error
        if (profileData.role === 'lecturer') {
          setError("This appears to be a lecturer account. Please use the lecturer dashboard.");
          return;
        }

        // Use department as class, or default to "General"
        if (profileData.department) {
          setStudentClass(profileData.department);
        }

        // Fetch all data without filtering by class first to see what's available
        await Promise.all([
          fetchUpcomingClasses(profileData.department),
          fetchAssignments(profileData.department),
          fetchStudyMaterials(profileData.department),
          fetchUpdates(profileData.department),
          fetchLibraryStatus()
        ]);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingClasses = async (studentClass?: string) => {
    try {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      console.log("Fetching classes for:", studentClass, "on", dayOfWeek);
      
      let query = supabase
        .from("timetable")
        .select("*")
        .eq("day_of_week", dayOfWeek)
        .order("start_time");

      // If we have a class, filter by it, otherwise get all classes for today
      if (studentClass) {
        query = query.eq("class", studentClass);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching upcoming classes:", error);
        return;
      }

      console.log("Found timetable entries:", data);

      // Filter classes that are still upcoming today
      const currentTimeString = today.toTimeString().slice(0, 5);
      const upcoming = data?.filter(classItem => classItem.start_time > currentTimeString) || [];
      
      setUpcomingClasses(upcoming.slice(0, 3));
    } catch (error) {
      console.error("Error in fetchUpcomingClasses:", error);
    }
  };

  const fetchAssignments = async (studentClass?: string) => {
    try {
      let query = supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // If we have a class, filter by it
      if (studentClass) {
        query = query.eq("class", studentClass);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching assignments:", error);
        return;
      }

      console.log("Found assignments:", data);
      setAssignments(data || []);
    } catch (error) {
      console.error("Error in fetchAssignments:", error);
    }
  };

  const fetchStudyMaterials = async (studentClass?: string) => {
    try {
      let query = supabase
        .from("study_materials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // If we have a class, filter by it
      if (studentClass) {
        query = query.eq("class", studentClass);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching study materials:", error);
        return;
      }

      console.log("Found study materials:", data);
      setStudyMaterials(data || []);
    } catch (error) {
      console.error("Error in fetchStudyMaterials:", error);
    }
  };

  const fetchUpdates = async (studentClass?: string) => {
    try {
      let query = supabase
        .from("updates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      // If we have a class, filter for class-specific or general updates
      if (studentClass) {
        query = query.or(`target_class.eq.${studentClass},target_class.is.null,target_class.eq.all`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching updates:", error);
        return;
      }

      console.log("Found updates:", data);
      setUpdates(data || []);
    } catch (error) {
      console.error("Error in fetchUpdates:", error);
    }
  };

  const fetchLibraryStatus = async () => {
    // Simulate dynamic data
    const current = Math.floor(Math.random() * 200) + 100;
    const availableRooms = Math.floor(Math.random() * 5) + 8;
    
    setLibraryCapacity({
      current,
      total: 315,
      availableRooms
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const quickActions = [
    {
      title: "My Schedule",
      description: "View your class timetable",
      icon: Calendar,
      color: "bg-blue-500",
      onClick: () => window.location.href = "/schedule"
    },
    {
      title: "Assignments",
      description: "View and submit assignments",
      icon: FileText,
      color: "bg-green-500",
      onClick: () => window.location.href = "/assignments"
    },
    {
      title: "Study Materials",
      description: "Access learning resources",
      icon: BookOpen,
      color: "bg-purple-500",
      onClick: () => window.location.href = "/materials"
    },
    {
      title: "Request Consultation",
      description: "Book time with lecturers",
      icon: MessageSquare,
      color: "bg-orange-500",
      onClick: () => window.location.href = "/consultations"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back, {userName}!</h1>
            <p className="text-blue-100 mb-2">
              {studentClass && `Department: ${studentClass}`}
            </p>
            <p className="text-blue-100 mb-4 md:mb-0">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-blue-100 text-lg font-medium">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              <TrendingUp className="w-4 h-4 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingClasses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <FileText className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Materials</CardTitle>
            <BookOpen className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studyMaterials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
            <Bell className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{updates.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your upcoming classes and activities</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-primary">
                        {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <h4 className="font-medium mt-1">{classItem.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      {classItem.room} • {classItem.class}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Navigation className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={action.onClick}
                >
                  <div className={`p-2 rounded-md ${action.color} text-white mr-3`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates & Library Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Updates
            </CardTitle>
            <CardDescription>Latest announcements from your lecturers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {updates.length > 0 ? (
              updates.map((update) => (
                <div key={update.id} className="border-l-4 border-l-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{update.title}</h4>
                    <Badge variant="secondary" className="text-xs">Update</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{update.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {getTimeAgo(update.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No recent updates</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Library Status
            </CardTitle>
            <CardDescription>Real-time capacity and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Current Capacity</span>
                <span className="text-sm text-muted-foreground">
                  {libraryCapacity.current}/{libraryCapacity.total} seats
                </span>
              </div>
              <Progress 
                value={(libraryCapacity.current / libraryCapacity.total) * 100} 
                className="h-2" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {libraryCapacity.total - libraryCapacity.current}
                </div>
                <div className="text-xs text-muted-foreground">Available Seats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {libraryCapacity.availableRooms}
                </div>
                <div className="text-xs text-muted-foreground">Study Rooms</div>
              </div>
            </div>
            <Button className="w-full" size="sm">
              Reserve Study Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;