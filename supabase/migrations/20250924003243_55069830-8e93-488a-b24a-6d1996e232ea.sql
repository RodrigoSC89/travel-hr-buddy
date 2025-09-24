-- Create user recommendations table
CREATE TABLE public.user_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context TEXT NOT NULL CHECK (context IN ('dashboard', 'hr', 'travel', 'finance', 'general')),
  recommendations JSONB NOT NULL DEFAULT '[]',
  insights JSONB DEFAULT '[]',
  quick_actions JSONB DEFAULT '[]',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create intelligent notifications table
CREATE TABLE public.intelligent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('smart_alert', 'system_insight', 'recommendation_update', 'performance_summary')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_text TEXT,
  action_type TEXT CHECK (action_type IN ('navigate', 'configure', 'dismiss', 'learn')),
  action_data JSONB,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligent_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.user_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations" 
ON public.user_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" 
ON public.user_recommendations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for intelligent_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.intelligent_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.intelligent_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.intelligent_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_intelligent_notifications_updated_at
BEFORE UPDATE ON public.intelligent_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_recommendations_user_id ON public.user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_context ON public.user_recommendations(context);
CREATE INDEX idx_user_recommendations_generated_at ON public.user_recommendations(generated_at DESC);

CREATE INDEX idx_intelligent_notifications_user_id ON public.intelligent_notifications(user_id);
CREATE INDEX idx_intelligent_notifications_type ON public.intelligent_notifications(type);
CREATE INDEX idx_intelligent_notifications_priority ON public.intelligent_notifications(priority);
CREATE INDEX idx_intelligent_notifications_created_at ON public.intelligent_notifications(created_at DESC);
CREATE INDEX idx_intelligent_notifications_is_read ON public.intelligent_notifications(is_read);