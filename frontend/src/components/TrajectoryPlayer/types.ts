export interface TrajectoryStep {
  id: string;
  image_url: string;
  action_type: 'CLICK' | 'TYPE' | 'MOVE_TO' | 'NONE';
  action_coordinates?: { x: number; y: number }; // Normalized coordinates (0-1)
  action_text?: string;
  description: string;
  timestamp: number;
}

export interface Trajectory {
  id: string;
  name: string;
  steps: TrajectoryStep[];
}

// Props for the main TrajectoryPlayer component
export interface TrajectoryPlayerProps {
  trajectory: Trajectory;
  imageWidth?: number; // Optional: specify a fixed width for the image display area
  imageHeight?: number; // Optional: specify a fixed height for the image display area
}

// Props for the Cursor component
export interface CursorProps {
  x: number; // Pixel value
  y: number; // Pixel value
  visible: boolean;
  actionType: TrajectoryStep['action_type'];
}

// Props for the Controls component
export interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canPrevious: boolean;
  canNext: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
} 