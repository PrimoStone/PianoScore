import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import '../styles/GestureRecognition.css';

const GestureRecognition = ({ onGesture, enabled }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [showDebugView, setShowDebugView] = useState(false);
  const lastGestureTimeRef = useRef(0);
  const lastGestureRef = useRef(null);
  const detectionFrameRef = useRef(null);
  const handPresentRef = useRef(false);
  const GESTURE_COOLDOWN = 1000; // 1 second cooldown between gestures

  // Initialize TensorFlow and load handpose model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await handpose.load();
        setModel(loadedModel);
        console.log("Handpose model loaded!");
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };
    loadModel();

    return () => {
      if (detectionFrameRef.current) {
        cancelAnimationFrame(detectionFrameRef.current);
      }
    };
  }, []);

  // Start/Stop detection based on enabled prop
  useEffect(() => {
    if (enabled && model) {
      console.log("Starting detection...");
      detect();
    } else if (!enabled && detectionFrameRef.current) {
      console.log("Stopping detection...");
      cancelAnimationFrame(detectionFrameRef.current);
      detectionFrameRef.current = null;
      
      // Clear canvas when disabled
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [enabled, model]);

  // Detect hand gestures
  const detect = async () => {
    if (!model || !webcamRef.current?.video || !canvasRef.current || !enabled) {
      return;
    }

    try {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Set video width and height
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detection
      const hands = await model.estimateHands(video);
      
      // Track hand presence/absence
      const handCurrentlyPresent = hands.length > 0;
      
      if (handCurrentlyPresent) {
        if (!handPresentRef.current) {
          // Hand just appeared
          handPresentRef.current = true;
          const gesture = interpretGesture(hands[0]);
          if (gesture) {
            const currentTime = Date.now();
            if (currentTime - lastGestureTimeRef.current >= GESTURE_COOLDOWN) {
              console.log("Gesture detected on hand appear:", gesture);
              onGesture(gesture);
              lastGestureTimeRef.current = currentTime;
              lastGestureRef.current = gesture;
            }
          }
        }
      } else {
        // Hand disappeared
        if (handPresentRef.current) {
          console.log("Hand disappeared");
          handPresentRef.current = false;
        }
      }

      // Draw hand landmarks
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hands, ctx);

    } catch (error) {
      console.error("Error in detect():", error);
    }

    // Continue detection loop only if still enabled
    if (enabled) {
      detectionFrameRef.current = requestAnimationFrame(detect);
    }
  };

  // Interpret the detected hand pose into a gesture
  const interpretGesture = (hand) => {
    const landmarks = hand.landmarks;
    const palmBase = landmarks[0];
    const thumb = landmarks[4];
    const indexFinger = landmarks[8];
    
    // Calculate angles and distances for gesture recognition
    const thumbUp = thumb[1] < palmBase[1] - 50;
    const indexPointing = indexFinger[0] > palmBase[0] + 50;
    
    // Add minimum movement threshold
    const MIN_MOVEMENT = 30; // pixels
    
    if (thumbUp && Math.abs(thumb[1] - palmBase[1]) > MIN_MOVEMENT) {
      return 'NEXT_PAGE';
    } else if (indexPointing && Math.abs(indexFinger[0] - palmBase[0]) > MIN_MOVEMENT) {
      return 'PREVIOUS_PAGE';
    }
    
    return null;
  };

  // Draw hand landmarks on canvas
  const drawHand = (predictions, ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw hand landmarks
    predictions.forEach((prediction) => {
      const landmarks = prediction.landmarks;

      // Draw dots
      for (let i = 0; i < landmarks.length; i++) {
        const [x, y] = landmarks[i];
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 3 * Math.PI);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
      }

      // Draw skeleton
      const fingers = [[0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], [0,13,14,15,16], [0,17,18,19,20]];
      fingers.forEach(finger => {
        for (let i = 0; i < finger.length - 1; i++) {
          const [x1, y1] = landmarks[finger[i]];
          const [x2, y2] = landmarks[finger[i + 1]];
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = "#00FF00";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });
  };

  return (
    <div className="gesture-recognition">
      <button 
        className="debug-view-toggle"
        onClick={() => setShowDebugView(!showDebugView)}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          opacity: 0.8,
          transition: "opacity 0.2s",
          fontSize: "12px"
        }}
      >
        {showDebugView ? "Hide Debug View" : "Show Debug View"}
      </button>
      
      <div style={{
        position: "fixed",
        top: "10px",
        right: "120px",
        width: showDebugView ? "320px" : "25px",
        height: showDebugView ? "240px" : "25px",
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: showDebugView ? "8px" : "4px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        boxShadow: showDebugView ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none"
      }}>
        <Webcam
          ref={webcamRef}
          style={{
            width: "640px",
            height: "480px",
            transform: showDebugView ? "scale(0.5)" : "scale(0.04)",
            transformOrigin: "top left",
            transition: "transform 0.3s ease"
          }}
          videoConstraints={{
            width: 640,
            height: 480
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "640px",
            height: "480px",
            transform: showDebugView ? "scale(0.5)" : "scale(0.04)",
            transformOrigin: "top left",
            transition: "transform 0.3s ease"
          }}
        />
      </div>
    </div>
  );
};

export default GestureRecognition;
