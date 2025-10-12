import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  AlertCircle,
  TrendingUp,
  Navigation
} from "lucide-react";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dashboardStats = [
    {
      title: "Campus Buildings",
      value: "24",
      description: "23 open, 1 closed",
      icon: MapPin,
      color: "text-blue-600"
    },
    {
      title: "Today's Classes",
      value: "6",
      description: "3 completed, 3 upcoming",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Faculty Available",
      value: "18",
      description: "Out of 25 total",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Library Capacity",
      value: "78%",
      description: "245/315 seats occupied",
      icon: BookOpen,
      color: "text-orange-600"
    }
  ];

  const upcomingClasses = [
    {
      time: "2:00 PM",
      subject: "Computer Science 101",
      location: "Science Building - Room 204",
      status: "upcoming"
    },
    {
      time: "3:30 PM",
      subject: "Mathematics",
      location: "Engineering Hall - Room 156",
      status: "upcoming"
    },
    {
      time: "5:00 PM",
      subject: "Physics Lab",
      location: "Science Building - Lab 3",
      status: "upcoming"
    }
  ];

  const quickActions = [
    {
      title: "Find Classroom",
      description: "Locate your next class",
      icon: Navigation,
      color: "bg-blue-500"
    },
    {
      title: "Check Schedule",
      description: "View today's agenda",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "Campus Map",
      description: "Interactive navigation",
      icon: MapPin,
      color: "bg-purple-500"
    },
    {
      title: "Faculty Hours",
      description: "Office availability",
      icon: Clock,
      color: "bg-orange-500"
    }
  ];

  const campusAlerts = [
    {
      type: "info",
      title: "Library Extended Hours",
      message: "Open until midnight during finals week",
      time: "2 hours ago"
    },
    {
      type: "event",
      title: "Tech Fair Today",
      message: "Student Center, 2:00 PM - 6:00 PM",
      time: "4 hours ago"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back!</h1>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
            {upcomingClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-primary">{classItem.time}</div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <h4 className="font-medium mt-1">{classItem.subject}</h4>
                  <p className="text-sm text-muted-foreground">{classItem.location}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Navigation className="h-4 w-4 mr-1" />
                  Navigate
                </Button>
              </div>
            ))}
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

      {/* Campus Alerts & Library Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Campus Alerts
            </CardTitle>
            <CardDescription>Latest updates and announcements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campusAlerts.map((alert, index) => (
              <div key={index} className="border-l-4 border-l-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge variant="secondary" className="text-xs">{alert.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            ))}
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
                <span className="text-sm text-muted-foreground">245/315 seats</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">70</div>
                <div className="text-xs text-muted-foreground">Available Seats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
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
