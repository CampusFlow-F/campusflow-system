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
  FileText
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
  const [studentClass, setStudentClass] = useState<string>("");
  const [libraryCapacity, setLibraryCapacity] = useState({
    current: 0,
    total: 315,
    availableRooms: 0
  });

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
    const { data} = await supabase.auth.getUser();
    if (!data ) return;

    // Get student's class
    const { data: studentData } = await supabase
      .from('students')
      .select('class')
      .eq('id', user.id)
      .single();

    if (studentData) {
      setStudentClass(studentData.class);
      await Promise.all([
        fetchUpcomingClasses(studentData.class),
        fetchAssignments(studentData.class),
        fetchStudyMaterials(studentData.class),
        fetchUpdates(studentData.class),
        fetchLibraryStatus()
      ]);
    }
  };

  const fetchUpcomingClasses = async (studentClass: string) => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const { data, error } = await supabase
      .from("timetable")
      .select("*")
      .eq("class", studentClass)
      .eq("day_of_week", dayOfWeek)
      .order("start_time");

    if (error) {
      console.error("Error fetching upcoming classes:", error);
      return;
    }

    // Filter classes that are still upcoming today
    const currentTimeString = today.toTimeString().slice(0, 5);
    const upcoming = data?.filter(classItem => classItem.start_time > currentTimeString) || [];
    
    setUpcomingClasses(upcoming.slice(0, 3));
  };

  const fetchAssignments = async (studentClass: string) => {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("class", studentClass)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching assignments:", error);
      return;
    }

    setAssignments(data || []);
  };

  const fetchStudyMaterials = async (studentClass: string) => {
    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("class", studentClass)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching study materials:", error);
      return;
    }

    setStudyMaterials(data || []);
  };

  const fetchUpdates = async (studentClass: string) => {
    const { data, error } = await supabase
      .from("updates")
      .select("*")
      .or(`target_class.eq.${studentClass},target_class.is.null,target_class.eq.all`)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("Error fetching updates:", error);
      return;
    }

    setUpdates(data || []);
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back, Student!</h1>
            <p className="text-blue-100 mb-2">
              {studentClass && `Class: ${studentClass}`}
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
                      {classItem.room}
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
                <p>No more classes scheduled for today</p>
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