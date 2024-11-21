# PianoScore - Gesture-Controlled Piano Sheet Music Reader

## Overview
PianoScore is a web-based application that allows musicians to read and navigate through piano sheet music using hand gestures. The app uses computer vision and machine learning to detect specific hand gestures for hands-free page navigation, making it ideal for pianists during practice or performance.

## Tech Stack
- **Frontend Framework**: React
- **Machine Learning**: TensorFlow.js
- **Hand Detection**: @tensorflow-models/handpose
- **Camera Interface**: react-webcam
- **Styling**: CSS with modern transitions and transforms

## Key Features
1. **Gesture-Based Navigation**
   - Hands-free page turning
   - Thumb up gesture for next page
   - Index finger pointing for previous page
   - Smart gesture detection with hand presence/absence tracking

2. **Unobtrusive Interface**
   - Minimalistic 25x25px camera view
   - Expandable debug view (320x240px)
   - Smooth transitions between views

3. **Developer-Friendly**
   - Debug mode for gesture visualization
   - Console logging for gesture detection
   - Configurable gesture sensitivity

## Project Structure
```
PianoScore/
├── src/
│   ├── components/
│   │   ├── GestureRecognition.jsx    # Main gesture detection component
│   │   └── [Other React components]
│   ├── styles/
│   │   ├── GestureRecognition.css    # Styles for gesture component
│   │   └── [Other style files]
│   └── [Other source files]
├── public/
│   └── [Static assets]
└── package.json
```

## Key Components

### GestureRecognition.jsx
The core component handling gesture detection and interpretation.

**Features**:
- TensorFlow.js integration for hand pose detection
- Gesture interpretation logic
- Camera feed management
- Debug view toggle
- Hand presence/absence tracking

**Props**:
- `onGesture`: Callback function for gesture events
- `enabled`: Toggle for gesture detection

## Gesture Detection Logic

1. **Hand Tracking**
   - Uses TensorFlow.js and Handpose model
   - Tracks hand landmarks in real-time
   - Maintains full 640x480 resolution internally
   - Scaled down to 25x25px for display

2. **Gesture Recognition**
   - Detects specific hand poses
   - Implements cooldown period (1 second)
   - Requires hand to disappear before next gesture
   - Prevents accidental continuous page turns

## Development Guidelines

### Adding New Gestures
1. Modify `interpretGesture()` function in GestureRecognition.jsx
2. Add new landmark calculations as needed
3. Update gesture types in documentation

### UI Modifications
1. Camera view styling in GestureRecognition.css
2. Debug view customization in component
3. Maintain unobtrusive design principles

### Performance Considerations
- Hand detection runs at full resolution
- Use CSS transforms for view scaling
- Implement gesture cooldown periods
- Consider memory usage with continuous detection

## Future Improvements
1. Additional gesture types
2. Gesture sensitivity settings
3. Custom gesture mapping
4. Performance optimizations
5. Mobile device support

## Setup Instructions
1. Clone repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Access app at `localhost:3000`

## Dependencies
- react
- @tensorflow/tfjs
- @tensorflow-models/handpose
- react-webcam

## Notes
- Camera access required
- Modern browser with WebGL support needed
- Sufficient lighting recommended for optimal detection
