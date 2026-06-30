import { useCallback, useEffect, useRef, useState } from "react";
import type { UserProfile } from "../profile";
import type { AnalyzeResult } from "../types";
import { ReadOverlay } from "../components/ReadOverlay";

interface Props {
  profile: UserProfile;
}

const READ_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const CAPTURE_INTERVAL_MS = 1000; // hard cap: at most once per second

type Status = "idle" | "starting" | "working" | "waiting" | "error";

export function ReadPage({ profile }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inFlightRef = useRef(false);
  const stopAtRef = useRef<number>(0);
  const loopTimerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const hasAnyData = Object.values(profile).some(
    (v) => v && String(v).trim() !== ""
  );

  const stopCamera = useCallback(() => {
    runningRef.current = false;
    if (loopTimerRef.current !== null) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setSecondsLeft(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Countdown ticker
  useEffect(() => {
    if (status === "idle" || status === "error") return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, stopAtRef.current - Date.now());
      setSecondsLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        stopCamera();
      }
    }, 500);
    return () => clearInterval(id);
  }, [status, stopCamera]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // JPEG at 0.7 keeps payload small enough for per-second uploads.
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  const sendFrame = useCallback(async () => {
    if (inFlightRef.current) return;
    if (!runningRef.current) return;
    const image = captureFrame();
    if (!image) return;
    inFlightRef.current = true;
    setStatus("working");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, profile }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as AnalyzeResult;
      setResult(data);
      setStatus("waiting");
    } catch (err) {
      console.error("[read] analyze failed", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Request failed");
      // Keep running — transient errors shouldn't kill the session.
    } finally {
      inFlightRef.current = false;
    }
  }, [captureFrame, profile]);

  const scheduleNext = useCallback(() => {
    if (!runningRef.current) return;
    loopTimerRef.current = window.setTimeout(async () => {
      if (!runningRef.current) return;
      await sendFrame();
      scheduleNext();
    }, CAPTURE_INTERVAL_MS);
  }, [sendFrame]);

  const start = useCallback(async () => {
    setErrorMsg("");
    setResult(null);
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      runningRef.current = true;
      stopAtRef.current = Date.now() + READ_DURATION_MS;
      setSecondsLeft(Math.ceil(READ_DURATION_MS / 1000));
      setStatus("waiting");
      // Kick off immediately, then schedule the loop.
      await sendFrame();
      scheduleNext();
    } catch (err) {
      console.error("[read] camera error", err);
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? `Camera: ${err.message}`
          : "Could not start camera"
      );
    }
  }, [scheduleNext, sendFrame]);

  const stop = useCallback(() => {
    stopCamera();
    setResult(null);
  }, [stopCamera]);

  const banner = (() => {
    if (status === "error") {
      return (
        <div className="banner empty">
          <div className="label">Error</div>
          <div className="instruction">{errorMsg || "Something went wrong"}</div>
        </div>
      );
    }
    if (result?.box && result.value) {
      return (
        <div className="banner">
          <div className="label">{result.label}</div>
          <div className="value">{result.value}</div>
          {result.instruction && (
            <div className="instruction">{result.instruction}</div>
          )}
        </div>
      );
    }
    return (
      <div className="banner empty">
        <div className="label">
          {status === "idle" ? "Tap Read to begin" : "Looking for a form…"}
        </div>
        <div className="instruction">
          {hasAnyData
            ? status === "idle"
              ? "Fill in your Info first, then tap Read."
              : "Point at a form with blank fields"
            : "No saved info yet. Open the Info tab first."}
        </div>
      </div>
    );
  })();

  return (
    <div className="read">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        controls={false}
      />
      <canvas ref={canvasRef} />

      {banner}

      {status !== "idle" && status !== "error" && (
        <>
          <div className="timer">
            {Math.floor(secondsLeft / 60)}:
            {String(secondsLeft % 60).padStart(2, "0")}
          </div>
          <div
            className={
              "status" +
              (status === "working" ? " working" : "")
            }
          >
            {status === "working" ? "Reading…" : status === "starting" ? "Starting…" : "Live"}
          </div>
        </>
      )}

      <ReadOverlay result={result} />

      <div className="read-controls">
        {status === "idle" || status === "error" ? (
          <button className="btn btn-read" onClick={start}>
            Read
          </button>
        ) : (
          <button className="btn btn-stop" onClick={stop}>
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
