import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

import { Dialog as StudyRoomDialog, DialogContent as StudyRoomDialogContent, DialogHeader as StudyRoomDialogHeader, DialogTitle as StudyRoomDialogTitle } from "@/components/ui/dialog";

type Schedule = Tables<"schedules">;

const studyRooms = [
  { name: "Science Building Room 210", location: "Science Building, 2nd Floor", capacity:8 },
  { name: "Engineering Study Lounge", location: "Engineering Block, Ground Floor", capacity: 10 },
  { name: "Main Hall Study Area", location: "Main Hall, 3rd Floor", capacity: 12 },
];

const ScheduleViewer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState("monday");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    course: "",
    time: "",
    location: "",
    instructor: "",
    type: "Lecture",
    day_of_week: "monday"
  });
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);
  const [isStudyRoomDialogOpen, setIsStudyRoomDialogOpen] = useState(false);

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" }
  ];

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('time');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch schedules",
          variant: "destructive",
        });
        return;
      }

      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .insert({
          ...newSchedule,
          user_id: user.id
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add schedule",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Schedule added successfully!",
      });

      setIsAddDialogOpen(false);
      setNewSchedule({
        course: "",
        time: "",
        location: "",
        instructor: "",
        type: "Lecture",
        day_of_week: "monday"
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleEditSchedule = async () => {
    if (!editSchedule || !user) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          course: editSchedule.course,
          time: editSchedule.time,
          location: editSchedule.location,
          instructor: editSchedule.instructor,
          type: editSchedule.type,
          day_of_week: editSchedule.day_of_week
        })
        .eq('id', editSchedule.id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update schedule",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Schedule updated successfully!",
      });

      setIsEditDialogOpen(false);
      setEditSchedule(null);
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteScheduleId || !user) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', deleteScheduleId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete schedule",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Schedule deleted successfully!",
      });

      setIsDeleteDialogOpen(false);
      setDeleteScheduleId(null);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const currentSchedule = schedules.filter(schedule => schedule.day_of_week === selectedDay);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture": return "default";
      case "Tutorial": return "secondary";
      case "Lab": return "destructive";
      case "Seminar": return "outline";
      default: return "default";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading schedules...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Day Selector and Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <Button
              key={day.key}
              variant={selectedDay === day.key ? "default" : "outline"}
              onClick={() => setSelectedDay(day.key)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {day.label}
            </Button>
          ))}
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
              <DialogDescription>
                Add a new class to your schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course">Course Name</Label>
                <Input
                  id="course"
                  value={newSchedule.course}
                  onChange={(e) => setNewSchedule({...newSchedule, course: e.target.value})}
                  placeholder="e.g., Computer Science 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                    placeholder="e.g., 09:00 - 10:30"
                  />
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Select value={newSchedule.day_of_week} onValueChange={(value) => setNewSchedule({...newSchedule, day_of_week: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.key} value={day.key}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                  placeholder="e.g., SCI Building, Room 205"
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={newSchedule.instructor}
                  onChange={(e) => setNewSchedule({...newSchedule, instructor: e.target.value})}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newSchedule.type} onValueChange={(value) => setNewSchedule({...newSchedule, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lecture">Lecture</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSchedule}>
                  Add Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {currentSchedule.length > 0 ? (
          currentSchedule.map((class_item) => (
            <Card key={class_item.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{class_item.course}</CardTitle>
                  <Badge variant={getTypeColor(class_item.type)}>
                    {class_item.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{class_item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{class_item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {class_item.instructor}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditSchedule(class_item);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDeleteScheduleId(class_item.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Classes Scheduled</h3>
              <p className="text-muted-foreground">
                You have no classes scheduled for {days.find(d => d.key === selectedDay)?.label}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update your class details
            </DialogDescription>
          </DialogHeader>
          {editSchedule && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-course">Course Name</Label>
                <Input
                  id="edit-course"
                  value={editSchedule.course}
                  onChange={(e) => setEditSchedule({ ...editSchedule, course: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    value={editSchedule.time}
                    onChange={(e) => setEditSchedule({ ...editSchedule, time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-day">Day</Label>
                  <Select value={editSchedule.day_of_week} onValueChange={(value) => setEditSchedule({ ...editSchedule, day_of_week: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.key} value={day.key}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editSchedule.location}
                  onChange={(e) => setEditSchedule({ ...editSchedule, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Input
                  id="edit-instructor"
                  value={editSchedule.instructor}
                  onChange={(e) => setEditSchedule({ ...editSchedule, instructor: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editSchedule.type} onValueChange={(value) => setEditSchedule({ ...editSchedule, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lecture">Lecture</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSchedule}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchedule}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline">Export Schedule</Button>
        <Button variant="outline">Add to Calendar</Button>
        <Button variant="outline" onClick={() => setIsStudyRoomDialogOpen(true)}>
          Find Study Rooms
        </Button>
        <Button variant="outline">Set Reminders</Button>
      </div>

      {/* Study Room Dialog */}
      <StudyRoomDialog open={isStudyRoomDialogOpen} onOpenChange={setIsStudyRoomDialogOpen}>
        <StudyRoomDialogContent className="w-full max-w-md mx-auto rounded-lg shadow-lg p-4">
          <StudyRoomDialogHeader>
            <StudyRoomDialogTitle>Available Study Rooms</StudyRoomDialogTitle>
          </StudyRoomDialogHeader>
          <div className="space-y-4 mt-2">
            {studyRooms.map((room, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{room.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{room.location}</span>
                    <span className="text-xs">Capacity: {room.capacity}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setIsStudyRoomDialogOpen(false)}>
              Close
            </Button>
          </div>
        </StudyRoomDialogContent>
      </StudyRoomDialog>
    </div>
  );
};

export default ScheduleViewer;
