
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";

const NotificationCenter = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: "Class Reminder",
      message: "Computer Science 101 starts in 15 minutes",
      time: "5 min ago",
      type: "reminder",
      read: false
    },
    {
      id: 2,
      title: "Event Alert",
      message: "Tech Fair happening now at Student Center",
      time: "1 hour ago",
      type: "event",
      read: false
    },
    {
      id: 3,
      title: "System Update",
      message: "Library hours extended until midnight",
      time: "2 hours ago",
      type: "update",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reminder": return "bg-blue-500";
      case "event": return "bg-green-500";
      case "update": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative touch-manipulation">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <div className="border-b p-4">
          <h3 className="font-semibold text-base">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notifications
          </p>
        </div>
        <ScrollArea className="h-64 md:h-80">
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors active:bg-muted/30 ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getTypeColor(notification.type)}`} />
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{notification.title}</p>
                    <p className="text-sm text-muted-foreground leading-tight">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full" size="sm">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
