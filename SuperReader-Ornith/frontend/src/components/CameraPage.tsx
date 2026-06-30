import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserData, FieldMapping, AnalysisResult } from '../types/userData';

interface CameraPageProps {
  userData: UserData | null;
  onSwitchToInfo: () => void;
}

const CameraPage = ({ userData, onSwitchToInfo }: CameraPageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isReading, setIsReading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const analysisIntervalRef = useRef<number | null>(null);
  
  // Timer for reading mode
  useEffect(() => {
    let interval: number;
    
    if (isReading && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isReading) {
      setIsReading(false);
      stopCamera();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start reading mode
  const startReading = () => {
    if (!userData || Object.values(userData).every(v => !v)) {
      setError('Please fill in your information first.');
      return;
    }
    
    setIsReading(true);
    setTimeRemaining(300);
    setAnalysisResult(null);
    setFieldMappings([]);
    setCurrentFieldIndex(0);
    
    if (!isCameraActive) {
      startCamera();
    }
  };

  // Stop reading mode
  const stopReading = () => {
    setIsReading(false);
    setTimeRemaining(300);
    setAnalysisResult(null);
    setFieldMappings([]);
    setCurrentFieldIndex(0);
    stopCamera();
  };

  // Analyze current frame
  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setIsLoading(true);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to backend for analysis
      const response = await fetch('/api/llm/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageData,
          userData,
          documentType: 'government-form'
        })
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      
      if (result.success && result.fields) {
        setFieldMappings(result.fields);
        setDetectedText(result.detectedText || 'Document detected - analyzing...');
        
        // Auto-advance to next field
        setCurrentFieldIndex(prev => (prev + 1) % result.fields.length);
      } else {
        setError('Could not detect text. Please try again.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Error analyzing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  // Continuous analysis loop when reading
  useEffect(() => {
    let interval: number;
    
    if (isReading && isCameraActive) {
      analyzeFrame();
      interval = setInterval(analyzeFrame, 1000); // Every second as requested
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading, isCameraActive, analyzeFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle field navigation
  const goToNextField = () => {
    if (fieldMappings.length > 0) {
      setCurrentFieldIndex(prev => (prev + 1) % fieldMappings.length);
    }
  };

  const goToPreviousField = () => {
    if (fieldMappings.length > 0) {
      setCurrentFieldIndex(prev => (prev - 1 + fieldMappings.length) % fieldMappings.length);
    }
  };

  return (
    <div className="camera-page">
      {/* Video Feed */}
      <div className="video-container">
        <video 
          ref={videoRef} 
          className="camera-video" 
          autoPlay 
          playsInline
          muted
          style={{ display: isCameraActive ? 'block' : 'none' }}
        />
        
        {/* Overlay for detected fields */}
        {fieldMappings.length > 0 && (
          <div className="field-overlay">
            {fieldMappings.map((field, index) => (
              <div 
                key={index}
                className={`field-box ${index === currentFieldIndex ? 'active' : ''}`}
                style={{
                  left: `${(field.boundingBox.x / 1920) * 100}%`,
                  top: `${(field.boundingBox.y / 1080) * 100}%`,
                  width: `${(field.boundingBox.width / 1920) * 100}%`,
                  height: `${(field.boundingBox.height / 1080) * 100}%`,
                }}
              >
                {index === currentFieldIndex && (
                  <div className="field-label">
                    <span className="pencil-icon">✏️</span>
                    <span>{field.fieldName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator">
            Analyzing...
          </div>
        )}
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Status Bar at Top */}
      {isReading && (
        <div className="status-bar">
          <div className="timer-display" aria-live="polite">
            Time Remaining: {formatTime(timeRemaining)}
          </div>
          
          {detectedText && (
            <div className="detected-text-display" aria-live="assertive">
              <h2 className="large-text">{detectedText}</h2>
            </div>
          )}

          {fieldMappings.length > 0 && currentFieldIndex < fieldMappings.length && (
            <div className="current-field-info">
              <span className="field-name-large">
                {fieldMappings[currentFieldIndex].fieldName}: 
              </span>
              <span className="field-value-large" aria-live="polite">
                {fieldMappings[currentFieldIndex].value || '(Fill in this field)'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="camera-controls">
        {!isReading ? (
          <button 
            onClick={startReading}
            disabled={!userData || Object.values(userData).every(v => !v)}
            className="read-button primary large"
            aria-label="Start reading mode for 5 minutes"
          >
            📷 Read
          </button>
        ) : (
          <button 
            onClick={stopReading}
            className="stop-button secondary large"
            aria-label="Stop reading mode"
          >
            ⏹ Stop Reading
          </button>
        )}

        {isReading && fieldMappings.length > 0 && (
          <div className="field-navigation">
            <button 
              onClick={goToPreviousField}
              disabled={currentFieldIndex === 0}
              className="nav-button"
              aria-label="Previous field"
            >
              ⬆️
            </button>
            
            <span className="field-counter" aria-live="polite">
              Field {currentFieldIndex + 1} of {fieldMappings.length}
            </span>
            
            <button 
              onClick={goToNextField}
              disabled={currentFieldIndex === fieldMappings.length - 1}
              className="nav-button"
              aria-label="Next field"
            >
              ⬇️
            </button>
          </div>
        )}

        {/* Camera toggle when not reading */}
        {!isReading && (
          <button 
            onClick={startCamera}
            disabled={isCameraActive}
            className="camera-toggle-button"
            aria-label={isCameraActive ? 'Camera is active' : 'Turn on camera'}
          >
            {isCameraActive ? '📷 Camera On' : '📷 Turn On Camera'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
