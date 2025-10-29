/**
 * PATCH 562 - Beta User Feedback Form Component
 * Integrated feedback collection system for beta testing
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { saveFeedback, exportFeedbackToCSV, exportFeedbackToJSON } from './feedback-service';

interface FeedbackFormProps {
  userId?: string;
  sessionId?: string;
  currentRoute?: string;
  onSubmitSuccess?: () => void;
}

export const BetaFeedbackForm: React.FC<FeedbackFormProps> = ({
  userId,
  sessionId,
  currentRoute,
  onSubmitSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userId: userId || '',
    email: '',
    sessionId: sessionId || `session-${Date.now()}`,
    currentRoute: currentRoute || window.location.pathname,
    overallRating: '',
    usabilityRating: '',
    performanceRating: '',
    comments: '',
    featuresUsed: [] as string[],
    issuesEncountered: [] as string[],
    suggestions: '',
    wouldRecommend: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field: 'featuresUsed' | 'issuesEncountered', value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const feedback = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      };

      await saveFeedback(feedback);

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your valuable feedback!',
      });

      // Reset form
      setFormData({
        userId: userId || '',
        email: '',
        sessionId: `session-${Date.now()}`,
        currentRoute: window.location.pathname,
        overallRating: '',
        usabilityRating: '',
        performanceRating: '',
        comments: '',
        featuresUsed: [],
        issuesEncountered: [],
        suggestions: '',
        wouldRecommend: '',
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Beta Testing Feedback</CardTitle>
        <CardDescription>
          Help us improve by sharing your experience with Travel HR Buddy v3.5
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Experience Rating *</Label>
            <RadioGroup
              value={formData.overallRating}
              onValueChange={(value) => handleInputChange('overallRating', value)}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="overall-5" />
                <Label htmlFor="overall-5">5 - Excellent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="overall-4" />
                <Label htmlFor="overall-4">4 - Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="overall-3" />
                <Label htmlFor="overall-3">3 - Average</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="overall-2" />
                <Label htmlFor="overall-2">2 - Below Average</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="overall-1" />
                <Label htmlFor="overall-1">1 - Poor</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Usability Rating */}
          <div className="space-y-2">
            <Label>Usability (Ease of Use) *</Label>
            <RadioGroup
              value={formData.usabilityRating}
              onValueChange={(value) => handleInputChange('usabilityRating', value)}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="usability-5" />
                <Label htmlFor="usability-5">5 - Very Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="usability-4" />
                <Label htmlFor="usability-4">4 - Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="usability-3" />
                <Label htmlFor="usability-3">3 - Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="usability-2" />
                <Label htmlFor="usability-2">2 - Difficult</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="usability-1" />
                <Label htmlFor="usability-1">1 - Very Difficult</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Performance Rating */}
          <div className="space-y-2">
            <Label>Performance (Speed & Responsiveness) *</Label>
            <RadioGroup
              value={formData.performanceRating}
              onValueChange={(value) => handleInputChange('performanceRating', value)}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="performance-5" />
                <Label htmlFor="performance-5">5 - Very Fast</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="performance-4" />
                <Label htmlFor="performance-4">4 - Fast</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="performance-3" />
                <Label htmlFor="performance-3">3 - Acceptable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="performance-2" />
                <Label htmlFor="performance-2">2 - Slow</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="performance-1" />
                <Label htmlFor="performance-1">1 - Very Slow</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Features Used */}
          <div className="space-y-2">
            <Label>Features You Tested (Select all that apply)</Label>
            <div className="space-y-2">
              {[
                'Dashboard',
                'Crew Management',
                'Control Hub',
                'Document Management',
                'AI Assistant',
                'Analytics',
                'Reports',
                'Settings',
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature}`}
                    checked={formData.featuresUsed.includes(feature)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('featuresUsed', feature, checked as boolean)
                    }
                  />
                  <Label htmlFor={`feature-${feature}`} className="font-normal">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Issues Encountered */}
          <div className="space-y-2">
            <Label>Issues Encountered (Select all that apply)</Label>
            <div className="space-y-2">
              {[
                'Slow loading times',
                'UI/UX confusion',
                'Broken functionality',
                'Mobile responsiveness',
                'Navigation issues',
                'Data not saving',
                'Error messages',
                'None',
              ].map((issue) => (
                <div key={issue} className="flex items-center space-x-2">
                  <Checkbox
                    id={`issue-${issue}`}
                    checked={formData.issuesEncountered.includes(issue)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('issuesEncountered', issue, checked as boolean)
                    }
                  />
                  <Label htmlFor={`issue-${issue}`} className="font-normal">
                    {issue}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              placeholder="Share any specific issues, bugs, or positive experiences..."
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={4}
            />
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="suggestions">Suggestions for Improvement</Label>
            <Textarea
              id="suggestions"
              placeholder="What features or improvements would you like to see?"
              value={formData.suggestions}
              onChange={(e) => handleInputChange('suggestions', e.target.value)}
              rows={4}
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <Label>Would you recommend this system? *</Label>
            <RadioGroup
              value={formData.wouldRecommend}
              onValueChange={(value) => handleInputChange('wouldRecommend', value)}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="recommend-yes" />
                <Label htmlFor="recommend-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maybe" id="recommend-maybe" />
                <Label htmlFor="recommend-maybe">Maybe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="recommend-no" />
                <Label htmlFor="recommend-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
