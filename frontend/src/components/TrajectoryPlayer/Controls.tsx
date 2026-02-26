import React from 'react';
import { ControlsProps } from './types';

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  canPrevious,
  canNext,
  speed,
  onSpeedChange,
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-gray-100 rounded-b-lg">
      <button
        onClick={onPrevious}
        disabled={!canPrevious}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        onClick={onPlayPause}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 min-w-[80px]"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
      <div className="flex items-center space-x-2">
        <label htmlFor="speed-control" className="text-sm text-gray-600">
          Speed:
        </label>
        <select
          id="speed-control"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded bg-white text-sm"
        >
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
};

export default Controls; 