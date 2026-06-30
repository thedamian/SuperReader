import { Camera, Pencil, Square, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { hasUsefulProfile } from "./profile";
import type { Guidance, Profile } from "./types";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const FRAME_INTERVAL_MS = 1000;

type CameraPageProps = {
  profile: Profile;
  onOpenInfo: () => void;
};

type OcrResult = {
  text: string;
  hasText: boolean;
};

const idleGuidance: Guidance = {
  found: false,
  fieldKey: null,
  fieldLabel: null,
  answer: null,
  instruction: "Press Read when the form is in view.",
  confidence: 0,
  box: null
};

export function CameraPage({ profile, onOpenInfo }: CameraPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<import("tesseract.js").Worker | null>(null);
  const readingUntilRef = useRef<number>(0);
  const inFlightRef = useRef(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [status, setStatus] = useState("Starting camera...");
  const [guidance, setGuidance] = useState<Guidance>(idleGuidance);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (!mounted || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        setStatus("Camera ready.");
      } catch {
        setStatus("Camera blocked. Allow camera access in the browser.");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stream?.getTracks().forEach((track) => track.stop());
      void workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const maxWidth = 1024;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  }, []);

  const detectText = useCallback(async (imageDataUrl: string): Promise<OcrResult> => {
    setStatus("Looking for words...");
    const { createWorker } = await import("tesseract.js");

    if (!workerRef.current) {
      workerRef.current = await createWorker("eng");
    }

    const result = await workerRef.current.recognize(imageDataUrl);
    const text = result.data.text.trim();
    const words =
      (result.data as { words?: Array<{ confidence: number; text: string }> }).words?.filter(
        (word) => word.confidence > 45 && word.text.trim().length > 1
      ) ?? [];
    return {
      text,
      hasText: words.length > 0 || text.length > 5
    };
  }, []);

  const requestGuidance = useCallback(
    async (imageDataUrl: string, detectedText: string) => {
      setStatus("Reading the form...");
      const response = await fetch("/api/read-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, detectedText, profile })
      });

      const nextGuidance = (await response.json()) as Guidance;
      setGuidance(nextGuidance);
      setStatus(nextGuidance.found ? "Follow the yellow box." : nextGuidance.instruction);
    },
    [profile]
  );

  const scanOnce = useCallback(async () => {
    if (!isReading || inFlightRef.current || Date.now() > readingUntilRef.current) {
      if (Date.now() > readingUntilRef.current) {
        setIsReading(false);
        setStatus("Read session ended.");
      }
      return;
    }

    const frame = captureFrame();
    if (!frame) return;

    inFlightRef.current = true;
    try {
      const ocr = await detectText(frame);
      if (ocr.hasText) {
        await requestGuidance(frame, ocr.text);
      } else {
        setStatus("No words found yet.");
      }
    } catch {
      setStatus("Reading paused. Hold steady and try again.");
    } finally {
      inFlightRef.current = false;
    }
  }, [captureFrame, detectText, isReading, requestGuidance]);

  useEffect(() => {
    if (!isReading) return;
    void scanOnce();
    const interval = window.setInterval(() => {
      void scanOnce();
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [isReading, scanOnce]);

  function startReading() {
    if (!hasUsefulProfile(profile)) {
      setStatus("Save your information first.");
      onOpenInfo();
      return;
    }

    if (!cameraReady) {
      setStatus("Waiting for camera access.");
      return;
    }

    readingUntilRef.current = Date.now() + FIVE_MINUTES_MS;
    setGuidance(idleGuidance);
    setIsReading(true);
    setStatus("Reading for 5 minutes.");
  }

  function stopReading() {
    readingUntilRef.current = 0;
    setIsReading(false);
    setStatus("Stopped.");
  }

  return (
    <section className="camera-page" aria-label="Camera reader">
      <video className="camera-video" ref={videoRef} playsInline muted />
      <canvas className="capture-canvas" ref={canvasRef} aria-hidden="true" />

      <div className="answer-banner" aria-live="polite">
        <strong>{guidance.answer ?? guidance.instruction}</strong>
        {guidance.fieldLabel && <span>{guidance.fieldLabel}</span>}
      </div>

      {guidance.found && guidance.box && (
        <div
          className="guidance-box"
          style={{
            left: `${guidance.box.x * 100}%`,
            top: `${guidance.box.y * 100}%`,
            width: `${guidance.box.width * 100}%`,
            height: `${guidance.box.height * 100}%`
          }}
          aria-hidden="true"
        >
          <Pencil />
        </div>
      )}

      <div className="camera-status">
        <Zap aria-hidden="true" />
        <span>{status}</span>
      </div>

      <button
        className={isReading ? "read-button read-button--stop" : "read-button"}
        type="button"
        onClick={isReading ? stopReading : startReading}
      >
        {isReading ? <Square aria-hidden="true" /> : <Camera aria-hidden="true" />}
        {isReading ? "Stop" : "Read"}
      </button>
    </section>
  );
}
