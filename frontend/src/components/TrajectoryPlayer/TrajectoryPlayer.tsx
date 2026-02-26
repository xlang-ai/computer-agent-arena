import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrajectoryPlayerProps, TrajectoryStep } from './types';
import Cursor from './Cursor';
import Controls from './Controls';

const TrajectoryPlayer: React.FC<TrajectoryPlayerProps> = ({
  trajectory,
  imageWidth = 800, // Default image width
  imageHeight = 600, // Default image height
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep: TrajectoryStep | undefined = trajectory.steps[currentStepIndex];

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    clearExistingTimeout();
    if (stepIndex < 0 || stepIndex >= trajectory.steps.length) {
      setIsPlaying(false);
      setIsCursorVisible(false); // Hide cursor at the end or if out of bounds
      return;
    }
    setCurrentStepIndex(stepIndex);
    const step = trajectory.steps[stepIndex];

    if (step.action_type === 'NONE' && stepIndex === trajectory.steps.length - 1) {
        setIsCursorVisible(false); // Hide cursor on the last 'NONE' step
    } else if (step.action_coordinates && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = step.action_coordinates.x * rect.width;
      const y = step.action_coordinates.y * rect.height;
      setCursorPosition({ x, y });
      setIsCursorVisible(true);
    } else {
      setIsCursorVisible(false); // Hide cursor if no coordinates
    }

    if (isPlaying && stepIndex < trajectory.steps.length - 1) {
      const nextStep = trajectory.steps[stepIndex + 1];
      const delay = (nextStep.timestamp - step.timestamp) / playbackSpeed;
      timeoutRef.current = setTimeout(() => {
        goToStep(stepIndex + 1);
      }, Math.max(0, delay)); // Ensure delay is not negative
    }
     else if (isPlaying && stepIndex >= trajectory.steps.length -1) {
      setIsPlaying(false); // Stop playing at the end of the trajectory
    }

  }, [trajectory.steps, isPlaying, playbackSpeed, clearExistingTimeout]);

 useEffect(() => {
    // Effect to handle play/pause state changes
    if (isPlaying) {
      goToStep(currentStepIndex); // Start or resume playback
    } else {
      clearExistingTimeout(); // Clear timeout when paused
    }
    return clearExistingTimeout; // Cleanup on unmount or when isPlaying/currentStepIndex changes
  }, [isPlaying, clearExistingTimeout, goToStep, currentStepIndex]);

  useEffect(() => {
    // Reset cursor when image changes or on initial load if there are coordinates
    if (currentStep?.action_coordinates && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = currentStep.action_coordinates.x * rect.width;
      const y = currentStep.action_coordinates.y * rect.height;
      setCursorPosition({ x, y });
      setIsCursorVisible(true);
    } else if (currentStep?.action_type === 'NONE' && currentStepIndex === trajectory.steps.length -1 ){
        setIsCursorVisible(false);
    }else {
        setIsCursorVisible(false);
    }
  }, [currentStep, imageWidth, imageHeight]); // Re-calculate on image/step change


  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    goToStep(currentStepIndex + 1);
  };

  const handlePrevious = () => {
    goToStep(currentStepIndex - 1);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  if (!currentStep) {
    return <div className="p-4 text-red-500">Error: Trajectory step not found.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">{trajectory.name}</h2>
        <p className="text-sm text-gray-600">Step {currentStepIndex + 1} of {trajectory.steps.length}: {currentStep.description}</p>
         {currentStep.action_type === 'TYPE' && currentStep.action_text && (
          <p className="text-sm text-blue-500 mt-1">Typing: "{currentStep.action_text}"</p>
        )}
      </div>
      <div 
        ref={imageContainerRef} 
        className="relative w-full bg-gray-200" 
        style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
      >
        <img
          src={currentStep.image_url}
          alt={`Trajectory step ${currentStepIndex + 1}`}
          className="w-full h-full object-contain block"
        />
        <Cursor 
            x={cursorPosition.x} 
            y={cursorPosition.y} 
            visible={isCursorVisible} 
            actionType={currentStep.action_type} 
        />
      </div>
      <Controls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canPrevious={currentStepIndex > 0}
        canNext={currentStepIndex < trajectory.steps.length - 1}
        speed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  );
};

export default TrajectoryPlayer; 