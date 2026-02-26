import { Trajectory } from './types';

export const mockTrajectory: Trajectory = {
  id: 'traj_1',
  name: 'Sample Trajectory',
  steps: [
    {
      id: 'step_1',
      image_url: 'https://via.placeholder.com/800x600/FFA07A/000000?Text=Step+1',
      action_type: 'MOVE_TO',
      action_coordinates: { x: 0.5, y: 0.5 },
      description: 'Move cursor to the center of the screen.',
      timestamp: 0,
    },
    {
      id: 'step_2',
      image_url: 'https://via.placeholder.com/800x600/98FB98/000000?Text=Step+2',
      action_type: 'CLICK',
      action_coordinates: { x: 0.25, y: 0.25 },
      description: 'Click on the top-left quadrant.',
      timestamp: 1000,
    },
    {
      id: 'step_3',
      image_url: 'https://via.placeholder.com/800x600/ADD8E6/000000?Text=Step+3',
      action_type: 'TYPE',
      action_coordinates: { x: 0.75, y: 0.75 },
      action_text: 'Hello World!',
      description: 'Type "Hello World!" in the bottom-right quadrant.',
      timestamp: 2000,
    },
    {
      id: 'step_4',
      image_url: 'https://via.placeholder.com/800x600/FFD700/000000?Text=Step+4',
      action_type: 'NONE',
      description: 'End of trajectory.',
      timestamp: 3000,
    },
  ],
}; 