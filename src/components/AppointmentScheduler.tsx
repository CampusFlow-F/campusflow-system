
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Appointment = Tables<"appointments">;

const AppointmentScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const services = [
    { id: "faculty", name: "Faculty Meeting", description: "Meet with professors and lecturers" },
    { id: "medical", name: "Medical Consultation", description: "Campus health center appointments" },
    { id: "admin", name: "Administrative Meeting", description: "Academic affairs and registration" },
    { id: "counseling", name: "Student Counseling", description: "Academic and personal counseling" },
    { id: "career", name: "Career Services", description: "Career guidance and job placement" }
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        });
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          service_type: selectedService,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          purpose: purpose || null,
          status: 'pending'
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to schedule appointment",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      });

      // Reset form
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setPurpose("");
      
      fetchAppointments();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
  };

  const handleReschedule = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'rescheduled' })
        .eq('id', appointmentId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to reschedule appointment",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Appointment marked for rescheduling",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : serviceId;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Schedule New Appointment */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Appointment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">{service.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Available Time Slots</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Meeting</Label>
            <Textarea
              placeholder="Briefly describe the purpose of your appointment..."
              className="min-h-20"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleScheduleAppointment}
            disabled={!selectedService || !selectedDate || !selectedTime}
            className="w-full"
          >
            Schedule Appointment
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{getServiceName(appointment.service_type)}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.appointment_time}
                      </div>
                    </div>
                    {appointment.purpose && (
                      <p className="text-sm text-muted-foreground">
                        Purpose: {appointment.purpose}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={appointment.status === "confirmed" ? "default" : appointment.status === "pending" ? "secondary" : "outline"}>
                      {appointment.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReschedule(appointment.id)}
                      disabled={appointment.status === 'rescheduled'}
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
                <p className="text-muted-foreground">
                  You don't have any appointments scheduled yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentScheduler;
