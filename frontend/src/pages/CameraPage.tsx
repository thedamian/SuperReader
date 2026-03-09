import React, { useEffect, useRef, useState, useCallback } from "react";
import { PersonalData, DetectedField, STORAGE_KEY } from "../types";

const ANALYZE_INTERVAL_MS = 2000;

const CameraPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnalyzingRef = useRef(false);
  const isMountedRef = useRef(true);

  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Starting camera...");
  const [isReady, setIsReady] = useState(false);
  const [hasProfileData, setHasProfileData] = useState(false);
  const [apiError, setApiError] = useState(false);

  const getPersonalData = (): PersonalData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {} as PersonalData;
    try {
      return JSON.parse(stored) as PersonalData;
    } catch {
      return {} as PersonalData;
    }
  };

  /**
   * Draw red bounding boxes on the overlay canvas.
   *
   * The video uses objectFit: contain so the actual rendered video pixels
   * may have letterbox bars (black bands) on the sides or top/bottom.
   * We calculate those offsets so boxes land on the correct spot.
   */
  const drawOverlays = useCallback((fields: DetectedField[]) => {
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    const container = videoContainerRef.current;
    if (!video || !canvas || !container) return;

    // Match canvas internal resolution to the container's CSS pixel size
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (fields.length === 0) return;

    // --- Letterbox calculation for objectFit: contain ---
    // Fall back to 16:9 before video metadata loads
    const videoW = video.videoWidth || 1280;
    const videoH = video.videoHeight || 720;
    const videoAspect = videoW / videoH;
    const containerAspect = containerWidth / containerHeight;

    let renderWidth: number;
    let renderHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (videoAspect > containerAspect) {
      // Video wider than container → black bars top & bottom
      renderWidth = containerWidth;
      renderHeight = containerWidth / videoAspect;
      offsetX = 0;
      offsetY = (containerHeight - renderHeight) / 2;
    } else {
      // Video taller than container → black bars left & right
      renderWidth = containerHeight * videoAspect;
      renderHeight = containerHeight;
      offsetX = (containerWidth - renderWidth) / 2;
      offsetY = 0;
    }

    fields.forEach((field, index) => {
      const { x, y, width, height } = field.boundingBox;

      // Map normalized 0-1 coords → pixel coords inside the rendered video area
      const px = offsetX + x * renderWidth;
      const py = offsetY + y * renderHeight;
      const pw = width * renderWidth;
      const ph = height * renderHeight;

      // Red transparent fill
      ctx.fillStyle = "rgba(255, 0, 0, 0.22)";
      ctx.fillRect(px, py, pw, ph);

      // Thick red border
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 5;
      ctx.strokeRect(px, py, pw, ph);

      // Bold corner brackets
      const corner = Math.min(24, pw * 0.2, ph * 0.35);
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 7;
      ctx.lineCap = "square";

      ctx.beginPath(); ctx.moveTo(px, py + corner); ctx.lineTo(px, py); ctx.lineTo(px + corner, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + pw - corner, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw, py + corner); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py + ph - corner); ctx.lineTo(px, py + ph); ctx.lineTo(px + corner, py + ph); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + pw - corner, py + ph); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px + pw, py + ph - corner); ctx.stroke();

      // Label badge above the box (only for the primary / first field)
      if (index === 0) {
        const badgeText = `Write here: ${field.label}`;
        const fontSize = Math.max(14, Math.min(18, renderWidth * 0.045));
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        const textW = ctx.measureText(badgeText).width;
        const pad = 8;
        const badgeH = fontSize + pad * 2;
        const badgeY = py > badgeH + 6 ? py - badgeH - 4 : py + ph + 4;
        const badgeX = Math.min(px, containerWidth - textW - pad * 2 - 4);

        ctx.fillStyle = "#CC0000";
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, textW + pad * 2, badgeH, 5);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.fillText(badgeText, badgeX + pad, badgeY + fontSize + pad - 2);
      }
    });
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (isAnalyzingRef.current) return;
    const video = videoRef.current;
    const captureCanvas = captureCanvasRef.current;
    if (!video || !captureCanvas || video.readyState < 2) return;

    isAnalyzingRef.current = true;

    try {
      // Capture the full native video frame
      captureCanvas.width = video.videoWidth || 640;
      captureCanvas.height = video.videoHeight || 480;
      const ctx = captureCanvas.getContext("2d");
      if (!ctx) { isAnalyzingRef.current = false; return; }
      ctx.drawImage(video, 0, 0);

      const imageData = captureCanvas.toDataURL("image/jpeg", 0.8);
      const personalData = getPersonalData();

      const response = await fetch("/api/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, personalData }),
        signal: AbortSignal.timeout(20000),
      });

      if (!isMountedRef.current) return;

      if (!response.ok) {
        setApiError(true);
        setStatusMessage(`Server error (${response.status}) — check GEMINI_API_KEY in Firebase`);
        drawOverlays([]);
        return;
      }

      setApiError(false);
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
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("timeout") || msg.includes("abort")) {
        setStatusMessage("Analysis timed out — still scanning...");
        setApiError(false);
      } else {
        setApiError(true);
        setStatusMessage("Cannot reach server — check your connection");
      }
      drawOverlays([]);
    } finally {
      isAnalyzingRef.current = false;
    }
  }, [drawOverlays]);

  const startCamera = useCallback(async () => {
    const constraints: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: { facingMode: "environment" } },
      { video: true },
    ];

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        if (!isMountedRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        return;
      } catch {
        // try next constraint
      }
    }

    setCameraError(
      "Camera access was denied. Please allow camera permissions in your browser settings and reload the page."
    );
  }, []);

  // Mount: check profile data, start camera
  useEffect(() => {
    isMountedRef.current = true;

    const profileData = getPersonalData();
    const hasData = Object.values(profileData).some((v) => v && v.trim() !== "");
    setHasProfileData(hasData);

    if (hasData) startCamera().catch(console.error);

    return () => {
      isMountedRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCamera]);

  // Once video is ready and profile data exists, start analysis interval
  useEffect(() => {
    if (!isReady || !hasProfileData) return;

    setStatusMessage("Scanning for form fields...");

    // Run once immediately so there is no 2-second wait on first view
    captureAndAnalyze().catch(console.error);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      captureAndAnalyze().catch(console.error);
    }, ANALYZE_INTERVAL_MS);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isReady, hasProfileData, captureAndAnalyze]);

  const primaryField = detectedFields[0];
  const secondaryFields = detectedFields.slice(1, 3);

  // ── No profile data ──────────────────────────────────────────────────────────
  if (!hasProfileData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "32px", textAlign: "center", gap: "20px", backgroundColor: "#f0f4ff" }}>
        <span style={{ fontSize: "64px" }}>📝</span>
        <h2 style={{ fontSize: "26px", color: "#1e3a8a", fontWeight: "bold", margin: 0 }}>
          No Information Saved Yet
        </h2>
        <p style={{ fontSize: "20px", color: "#475569", margin: 0, lineHeight: 1.4 }}>
          Go to the <strong>👤 My Info</strong> tab, fill in your details, and tap <strong>Save</strong> — then come back here!
        </p>
      </div>
    );
  }

  // ── Camera permission denied ─────────────────────────────────────────────────
  if (cameraError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "32px", textAlign: "center", gap: "20px", backgroundColor: "#000" }}>
        <span style={{ fontSize: "64px" }}>📷</span>
        <p style={{ fontSize: "22px", color: "#fff", lineHeight: 1.4 }}>{cameraError}</p>
      </div>
    );
  }

  // ── Main camera view ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#000" }}>

      {/* Video + overlay container — flex: 1 so it fills all space above the bottom panel */}
      <div
        ref={videoContainerRef}
        style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#000" }}
      >
        {/*
          objectFit: contain — the full camera frame is always visible.
          This ensures bounding boxes from Gemini (which analyses the full frame)
          map correctly to the displayed area.
        */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          onCanPlay={() => setIsReady(true)}
        />

        {/* Red-box overlay — same size as container, drawn with letterbox offsets */}
        <canvas
          ref={overlayCanvasRef}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />

        {/* Hidden capture canvas */}
        <canvas ref={captureCanvasRef} style={{ display: "none" }} />

        {/* Status chip — top-centre of camera view */}
        <div style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: apiError ? "rgba(180,0,0,0.85)" : "rgba(0,0,0,0.65)",
          color: "white",
          padding: "6px 18px",
          borderRadius: "20px",
          fontSize: "14px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          {!isReady ? "⏳ Starting camera…" : apiError ? "⚠️ Server error" : "🔍 Scanning every 2 s"}
        </div>
      </div>

      {/* ── Bottom answer panel ─────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        backgroundColor: "white",
        borderTop: "4px solid #1e3a8a",
        padding: "14px 20px 18px",
        minHeight: "160px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "4px",
      }}>
        {primaryField ? (
          <>
            {/* Field name label */}
            <p style={{
              fontSize: "17px",
              color: "#1e3a8a",
              fontWeight: "bold",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              {primaryField.label}:
            </p>

            {/* Answer in very large easy-to-read text */}
            <p style={{
              fontSize: "54px",
              color: "#000",
              fontWeight: "bold",
              margin: 0,
              lineHeight: 1.1,
              textAlign: "center",
              wordBreak: "break-word",
            }}>
              {primaryField.value}
            </p>

            {/* Secondary fields as small badges */}
            {secondaryFields.length > 0 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                {secondaryFields.map((f) => (
                  <span key={f.fieldKey} style={{
                    backgroundColor: "#dbeafe",
                    border: "1px solid #93c5fd",
                    borderRadius: "8px",
                    padding: "4px 12px",
                    fontSize: "15px",
                    color: "#1e40af",
                  }}>
                    {f.label}: <strong>{f.value}</strong>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{
            fontSize: "22px",
            color: apiError ? "#dc2626" : "#475569",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.4,
          }}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
