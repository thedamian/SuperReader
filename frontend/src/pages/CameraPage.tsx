import React, { useEffect, useRef, useState, useCallback } from "react";
import { PersonalData, DetectedField, STORAGE_KEY } from "../types";

const ANALYZE_INTERVAL_MS = 2000;

const CameraPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnalyzingRef = useRef(false);
  const isMountedRef = useRef(true);

  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Starting camera...");
  const [isReady, setIsReady] = useState(false);
  const [hasProfileData, setHasProfileData] = useState(false);

  const getPersonalData = (): PersonalData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {} as PersonalData;
    try {
      return JSON.parse(stored) as PersonalData;
    } catch {
      return {} as PersonalData;
    }
  };

  const drawOverlays = useCallback((fields: DetectedField[]) => {
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    if (!video || !canvas) return;

    const displayWidth = video.offsetWidth;
    const displayHeight = video.offsetHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fields.forEach((field, index) => {
      const { x, y, width, height } = field.boundingBox;
      const px = x * displayWidth;
      const py = y * displayHeight;
      const pw = width * displayWidth;
      const ph = height * displayHeight;

      // Main red rectangle (thick border)
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 5;
      ctx.strokeRect(px, py, pw, ph);

      // Semi-transparent red fill
      ctx.fillStyle = "rgba(255, 0, 0, 0.18)";
      ctx.fillRect(px, py, pw, ph);

      // Corner markers for visibility
      const cornerSize = Math.min(20, pw * 0.15, ph * 0.3);
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 6;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(px, py + cornerSize);
      ctx.lineTo(px, py);
      ctx.lineTo(px + cornerSize, py);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(px + pw - cornerSize, py);
      ctx.lineTo(px + pw, py);
      ctx.lineTo(px + pw, py + cornerSize);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(px, py + ph - cornerSize);
      ctx.lineTo(px, py + ph);
      ctx.lineTo(px + cornerSize, py + ph);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(px + pw - cornerSize, py + ph);
      ctx.lineTo(px + pw, py + ph);
      ctx.lineTo(px + pw, py + ph - cornerSize);
      ctx.stroke();

      // Field label badge above the box
      if (index === 0) {
        const badgeText = `✏️ Write here: ${field.label}`;
        ctx.font = "bold 16px Arial, sans-serif";
        const textWidth = ctx.measureText(badgeText).width;
        const badgePadding = 8;
        const badgeHeight = 30;
        const badgeY = py > badgeHeight + 10 ? py - badgeHeight - 4 : py + ph + 4;

        // Badge background
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.roundRect(
          px,
          badgeY,
          textWidth + badgePadding * 2,
          badgeHeight,
          6
        );
        ctx.fill();

        // Badge text
        ctx.fillStyle = "white";
        ctx.fillText(badgeText, px + badgePadding, badgeY + 21);
      }
    });
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (isAnalyzingRef.current) return;
    const video = videoRef.current;
    const captureCanvas = captureCanvasRef.current;
    if (!video || !captureCanvas) return;
    if (video.readyState < 2) return; // HAVE_CURRENT_DATA

    isAnalyzingRef.current = true;

    try {
      // Capture the current video frame
      captureCanvas.width = video.videoWidth || 640;
      captureCanvas.height = video.videoHeight || 480;
      const ctx = captureCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);

      const imageData = captureCanvas.toDataURL("image/jpeg", 0.75);
      const personalData = getPersonalData();

      const response = await fetch("/api/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, personalData }),
        signal: AbortSignal.timeout(15000),
      });

      if (!isMountedRef.current) return;

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = (await response.json()) as { detectedFields: DetectedField[] };
      const fields: DetectedField[] = result.detectedFields || [];

      if (!isMountedRef.current) return;

      setDetectedFields(fields);

      if (fields.length === 0) {
        setStatusMessage("Point the camera at a form to get help");
        drawOverlays([]);
      } else {
        setStatusMessage("");
        drawOverlays(fields);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      // Silently handle errors — just keep scanning
      console.warn("Frame analysis:", err);
      setStatusMessage("Scanning for form fields...");
    } finally {
      isAnalyzingRef.current = false;
    }
  }, [drawOverlays]);

  const startCamera = useCallback(async () => {
    const constraints: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: "environment" } },
      { video: true },
    ];

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        if (!isMountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        return;
      } catch {
        // Try next constraint
      }
    }

    setCameraError("Camera access denied. Please allow camera permissions in your browser settings and reload the page.");
  }, []);

  // Start camera on mount
  useEffect(() => {
    isMountedRef.current = true;

    const profileData = getPersonalData();
    const hasData = Object.values(profileData).some((v) => v && v.trim() !== "");
    setHasProfileData(hasData);

    if (!hasData) {
      setStatusMessage("Please fill in your info on the My Info tab first");
    } else {
      startCamera().catch(console.error);
    }

    return () => {
      isMountedRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCamera]);

  // Start analysis interval once video is ready
  useEffect(() => {
    if (!isReady || !hasProfileData) return;

    setStatusMessage("Scanning for form fields...");

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      captureAndAnalyze().catch(console.error);
    }, ANALYZE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReady, hasProfileData, captureAndAnalyze]);

  const handleVideoReady = () => {
    setIsReady(true);
    setStatusMessage("Scanning for form fields...");
  };

  const primaryField = detectedFields[0];
  const secondaryFields = detectedFields.slice(1, 3);

  // Styles
  const pageStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const videoStyle: React.CSSProperties = {
    flex: 1,
    width: "100%",
    objectFit: "cover",
    display: "block",
  };

  const overlayCanvasStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    // Height computed to match video area (full height minus bottom panel)
    height: "calc(100% - 160px)",
    pointerEvents: "none",
  };

  const bottomPanelStyle: React.CSSProperties = {
    flexShrink: 0,
    backgroundColor: "white",
    borderTop: "4px solid #1e3a8a",
    padding: "12px 16px 16px",
    minHeight: "160px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  const fieldLabelStyle: React.CSSProperties = {
    fontSize: "18px",
    color: "#1e3a8a",
    fontWeight: "bold",
    margin: "0 0 4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const fieldValueStyle: React.CSSProperties = {
    fontSize: "52px",
    color: "#000000",
    fontWeight: "bold",
    margin: "0",
    lineHeight: 1.1,
    textAlign: "center",
    wordBreak: "break-word",
  };

  const statusTextStyle: React.CSSProperties = {
    fontSize: "22px",
    color: "#475569",
    textAlign: "center",
    margin: "0",
    lineHeight: 1.3,
  };

  const secondaryFieldsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
  };

  const secondaryBadgeStyle: React.CSSProperties = {
    backgroundColor: "#dbeafe",
    border: "1px solid #93c5fd",
    borderRadius: "8px",
    padding: "4px 10px",
    fontSize: "14px",
    color: "#1e40af",
  };

  const errorStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: "32px",
    textAlign: "center",
    gap: "20px",
    backgroundColor: "#000",
  };

  if (!hasProfileData) {
    return (
      <div style={{ ...pageStyle, backgroundColor: "#f0f4ff" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "32px",
            textAlign: "center",
            gap: "20px",
          }}
        >
          <span style={{ fontSize: "64px" }}>📝</span>
          <h2
            style={{
              fontSize: "26px",
              color: "#1e3a8a",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            No Information Saved Yet
          </h2>
          <p style={{ fontSize: "20px", color: "#475569", margin: 0, lineHeight: 1.4 }}>
            Please go to the <strong>👤 My Info</strong> tab, fill in your personal
            details, and tap <strong>Save</strong> — then come back here!
          </p>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>
          <span style={{ fontSize: "64px" }}>📷</span>
          <p style={{ fontSize: "22px", color: "#fff", lineHeight: 1.4 }}>
            {cameraError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Camera video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={videoStyle}
        onCanPlay={handleVideoReady}
      />

      {/* Hidden canvas for capturing frames */}
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />

      {/* Overlay canvas for drawing red boxes */}
      <canvas ref={overlayCanvasRef} style={overlayCanvasStyle} />

      {/* Scanning indicator (top of screen) */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "6px 16px",
          borderRadius: "20px",
          fontSize: "14px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {isReady ? (
          <span>🔍 Scanning every 2 seconds</span>
        ) : (
          <span>⏳ Starting camera...</span>
        )}
      </div>

      {/* Bottom information panel */}
      <div style={bottomPanelStyle}>
        {primaryField ? (
          <>
            <p style={fieldLabelStyle}>{primaryField.label}:</p>
            <p style={fieldValueStyle}>{primaryField.value}</p>

            {secondaryFields.length > 0 && (
              <div style={secondaryFieldsStyle}>
                {secondaryFields.map((f) => (
                  <span key={f.fieldKey} style={secondaryBadgeStyle}>
                    {f.label}: <strong>{f.value}</strong>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={statusTextStyle}>{statusMessage}</p>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
