-- Create profiles table for lecturer information (FIXED: This should be created first)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create table for user schedules
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  instructor TEXT NOT NULL,
  type TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  with_person TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for feedback
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  rating INTEGER,
  status TEXT NOT NULL DEFAULT 'under_review',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table (FIXED: references public.profiles instead of non-existent lecturer_profiles)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timetable table
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  class TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL,
  portal_open BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('sent', 'received')),
  student_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_materials table
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  class TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updates table
CREATE TABLE public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_class TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for all tables
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schedules
CREATE POLICY "Users can view their own schedules" ON public.schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own schedules" ON public.schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedules" ON public.schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedules" ON public.schedules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own appointments" ON public.appointments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feedback" ON public.feedback FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for push subscriptions
CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for lecturer-related tables
CREATE POLICY "Lecturers can manage their own students"
  ON public.students
  FOR ALL
  USING (auth.uid() = lecturer_id);

CREATE POLICY "Lecturers can manage their own timetable"
  ON public.timetable
  FOR ALL
  USING (auth.uid() = lecturer_id);

CREATE POLICY "Lecturers can manage their own assignments"
  ON public.assignments
  FOR ALL
  USING (auth.uid() = lecturer_id);

CREATE POLICY "Lecturers can manage their own consultations"
  ON public.consultations
  FOR ALL
  USING (auth.uid() = lecturer_id);

CREATE POLICY "Lecturers can manage their own reports"
  ON public.reports
  FOR ALL
  USING (auth.uid() = lecturer_id);

CREATE POLICY "Lecturers can manage their own study materials"
  ON public.study_materials
  FOR ALL
  USING (auth.uid() = lecturer_id);

CREATE POLICY "Lecturers can manage their own updates"
  ON public.updates
  FOR ALL
  USING (auth.uid() = lecturer_id);

-- Create indexes for better performance
CREATE INDEX idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX idx_schedules_day_of_week ON public.schedules(day_of_week);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_students_lecturer_id ON public.students(lecturer_id);
CREATE INDEX idx_timetable_lecturer_id ON public.timetable(lecturer_id);
CREATE INDEX idx_assignments_lecturer_id ON public.assignments(lecturer_id);
CREATE INDEX idx_consultations_lecturer_id ON public.consultations(lecturer_id);
CREATE INDEX idx_reports_lecturer_id ON public.reports(lecturer_id);
CREATE INDEX idx_study_materials_lecturer_id ON public.study_materials(lecturer_id);
CREATE INDEX idx_updates_lecturer_id ON public.updates(lecturer_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_updated_at
  BEFORE UPDATE ON public.timetable
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration (FIXED: Removed duplicate drop statements)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();