import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, Calendar, Bell, MessageSquare, Clock, Menu, LayoutDashboard, LogIn } from "lucide-react";
import Logo from "@/assets/imgs/logobg.png";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import MapComponent from "@/components/MapComponent";
import ScheduleViewer from "@/components/ScheduleViewer";
import FacultyDirectory from "@/components/FacultyDirectory";
import NotificationCenter from "@/components/NotificationCenter";
import ProfileMenu from "@/components/ProfileMenu";
import AppointmentScheduler from "@/components/AppointmentScheduler";
import FeedbackSystem from "@/components/FeedbackSystem";
import Dashboard from "@/components/Dashboard";
import ChatBot from "@/components/ChatBot";
import PWAInstallButton from "@/components/PWAInstallButton";
import PushNotificationToggle from "@/components/PushNotificationToggle";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div>
                <img src={Logo} alt="Logo" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to CampusFlow</CardTitle>
            <CardDescription>
              Your Campus Compass Guide - Please sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "map", label: "Maps", icon: MapPin },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "faculty", label: "Faculty", icon: Clock },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "appointments", label: "Appointments", icon: Clock },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Mobile-Optimized Header */}
        <header className="sticky top-0 z-50 border-b bg-[var(--primary)] backdrop-brightness-50 supports-[backdrop-filter]:bg-white shadow-sm">

          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MobileNavigation />
                <div>
                  <img src={Logo} alt="CampusFlow Logo" className="h-8 w-auto" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PWAInstallButton />
                <PushNotificationToggle />
                <NotificationCenter />
                <ProfileMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Mobile-First Design */}
        <main className="container mx-auto px-4 py-4 md:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Desktop: Standard Grid Layout */}
            <div className="hidden md:block mb-6">
              <TabsList className="grid w-full grid-cols-7">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="mt-0">
              <Dashboard />
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <img src={Logo} alt="CampusFlow Logo" className="h-8 w-auto" />
                    Interactive Campus Map
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Navigate your campus with real-time GPS and detailed building layouts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <MapComponent />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Calendar className="h-5 w-5" />
                    Academic Schedule
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View your classes and quickly navigate to locations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <ScheduleViewer />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faculty" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Clock className="h-5 w-5" />
                    Faculty & Office Directory
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Check availability and locate faculty offices
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <FacultyDirectory />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Bell className="h-5 w-5" />
                    Notifications & Alerts
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Stay updated with campus events and important announcements
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base">Library Hours Extended</h4>
                        <p className="text-sm text-muted-foreground mt-1">Open until midnight during finals week</p>
                      </div>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">New</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base">Campus Event: Tech Fair</h4>
                        <p className="text-sm text-muted-foreground mt-1">Tomorrow at Student Center, 2:00 PM</p>
                      </div>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">Event</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Clock className="h-5 w-5" />
                    Appointment Scheduling
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Schedule meetings with faculty, medical staff, and administration
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <AppointmentScheduler />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <MessageSquare className="h-5 w-5" />
                    Feedback & Reporting
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Help us improve campus services and report issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <FeedbackSystem />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* AI Chatbot Component */}
        <ChatBot />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
