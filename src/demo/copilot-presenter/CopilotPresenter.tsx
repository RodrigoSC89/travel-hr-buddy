/**
 * PATCH 566 - Copilot Presenter Component
 * Interactive demo with voice narration and visual highlights
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, X, Volume2, VolumeX, RotateCcw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { demoSteps } from "./demo-steps";
import { useVoicePresenter } from "./useVoicePresenter";
import { DemoFeedback } from "./types";
import { logger } from "@/lib/logger";

export const CopilotPresenter: React.FC = () => {
  const navigate = useNavigate();
  const { isSupported, isSpeaking, config, setConfig, speak, stop } = useVoicePresenter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackList, setFeedbackList] = useState<DemoFeedback[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const currentDemoStep = demoSteps[currentStep];
  const progress = ((currentStep + 1) / demoSteps.length) * 100;

  useEffect(() => {
    logger.info("[CopilotPresenter] Initialized with", demoSteps.length, "steps");
  }, []);

  const handlePlay = async () => {
    if (!currentDemoStep) return;

    setIsPlaying(true);
    setIsPaused(false);

    // Navigate to the module route
    if (currentDemoStep.route) {
      navigate(currentDemoStep.route);
    }

    // Speak the narrative if not muted
    if (!isMuted && isSupported) {
      try {
        await speak(currentDemoStep.narrative);
        
        // Auto-advance after speech and duration
        setTimeout(() => {
          if (currentStep < demoSteps.length - 1) {
            handleNext();
          } else {
            setIsPlaying(false);
          }
        }, 1000);
      } catch (error) {
        logger.error("[CopilotPresenter] Speech error:", error);
        setIsPlaying(false);
      }
    } else {
      // Auto-advance based on duration if muted
      setTimeout(() => {
        if (currentStep < demoSteps.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }, currentDemoStep.duration || 5000);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsPlaying(false);
    stop();
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      stop();
      setCurrentStep(currentStep + 1);
      
      // If playing, auto-play next step
      if (isPlaying) {
        setTimeout(() => handlePlay(), 500);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      stop();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    stop();
    setCurrentStep(0);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleClose = () => {
    stop();
    navigate("/");
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      const feedback: DemoFeedback = {
        stepId: currentDemoStep.id,
        rating: 5,
        comment: feedbackText,
        timestamp: new Date(),
      };
      
      setFeedbackList([...feedbackList, feedback]);
      setFeedbackText("");
      setShowFeedback(false);
      
      logger.info("[CopilotPresenter] Feedback submitted for", currentDemoStep.id);
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stop();
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setConfig({ ...config, rate: value[0] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-slate-900 border-slate-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: isSpeaking ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isSpeaking ? Infinity : 0 }}
                  >
                    🎯
                  </motion.div>
                  Copilot Presenter
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Interactive guided tour with AI narration
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Step {currentStep + 1} of {demoSteps.length}
                </span>
                <span className="text-slate-400">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {currentDemoStep?.module}
                      </Badge>
                      {isSpeaking && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex items-center gap-1 text-green-400 text-sm"
                        >
                          <Volume2 className="h-4 w-4" />
                          Speaking...
                        </motion.div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold">{currentDemoStep?.title}</h3>
                    <p className="text-slate-300">{currentDemoStep?.description}</p>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{currentDemoStep?.narrative}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                {!isPlaying ? (
                  <Button
                    size="lg"
                    onClick={handlePlay}
                    className="px-8"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {currentStep === 0 && !isPaused ? "Start Tour" : "Continue"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handlePause}
                    variant="secondary"
                    className="px-8"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentStep === demoSteps.length - 1}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRestart}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVolumeToggle}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFeedback(!showFeedback)}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>

              {/* Speed Control */}
              {isSupported && !isMuted && (
                <div className="flex items-center gap-4 px-4">
                  <span className="text-sm text-slate-400 whitespace-nowrap">Speed: {config.rate.toFixed(1)}x</span>
                  <Slider
                    value={[config.rate]}
                    onValueChange={handleSpeedChange}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                </div>
              )}
            </div>

            {/* Feedback Form */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-slate-400">
                    Share your feedback about this step:
                  </label>
                  <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What did you think about this module?"
                    className="bg-slate-800 border-slate-700"
                    rows={3}
                  />
                  <Button onClick={handleSubmitFeedback} size="sm">
                    Submit Feedback
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info */}
            {!isSupported && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-400">
                ℹ️ Voice narration is not supported in your browser. The demo will continue with text only.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
