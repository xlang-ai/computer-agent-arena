import React from 'react';
import { CursorProps } from './types';

const Cursor: React.FC<CursorProps> = ({ x, y, visible, actionType }) => {
  if (!visible) {
    return null;
  }

  const cursorStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // Default red, semi-transparent
    border: '2px solid red',
    transform: 'translate(-50%, -50%)', // Center the cursor on the coordinates
    transition: 'left 0.1s ease-out, top 0.1s ease-out', // Smooth transition for movement
    pointerEvents: 'none', // Ensure cursor doesn't interfere with other interactions
    zIndex: 1000, // Ensure cursor is on top
  };

  // Customize cursor based on action type
  if (actionType === 'CLICK') {
    cursorStyle.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Green for click
    cursorStyle.borderColor = 'green';
  } else if (actionType === 'TYPE') {
    cursorStyle.backgroundColor = 'rgba(0, 0, 255, 0.5)'; // Blue for type
    cursorStyle.borderColor = 'blue';
    // Optionally, change shape or add an icon for typing
    cursorStyle.width = '10px';
    cursorStyle.height = '25px';
    cursorStyle.borderRadius = '2px';
  }

  return <div style={cursorStyle} data-testid="trajectory-cursor" />;
};

export default Cursor; 