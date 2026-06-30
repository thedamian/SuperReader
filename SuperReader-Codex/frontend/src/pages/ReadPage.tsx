import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { EMPTY_USER_INFO, type FieldBox, type UserInfo } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

const READ_DURATION_SECONDS = 300;
const CAPTURE_INTERVAL_MS = 1200;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getVideoDisplayRect(video: HTMLVideoElement | null): Rect | null {
  if (!video) return null;
  const videoWidth = video.videoWidth || video.clientWidth;
  const videoHeight = video.videoHeight || video.clientHeight;
  if (!videoWidth || !videoHeight) return null;

  const videoRatio = videoWidth / videoHeight;
  const containerWidth = video.clientWidth;
  const containerHeight = video.clientHeight;
  const containerRatio = containerWidth / containerHeight;

  let width = containerWidth;
  let height = containerHeight;
  let x = 0;
  let y = 0;

  if (videoRatio > containerRatio) {
    height = containerWidth / videoRatio;
    y = (containerHeight - height) / 2;
  } else {
    width = containerHeight * videoRatio;
    x = (containerWidth - width) / 2;
  }

  return { x, y, width, height };
}

export function ReadPage() {
  const navigate = useNavigate();
  const [userInfo] = useLocalStorage<UserInfo>(
    'superReaderUserInfo',
    EMPTY_USER_INFO
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isReading, setIsReading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(READ_DURATION_SECONDS);
  const [fields, setFields] = useState<FieldBox[]>([]);
  const [instruction, setInstruction] = useState<string>(
    'Point camera at a form and press Read'
  );
  const [displayRect, setDisplayRect] = useState<Rect | null>(null);
  const analyzingRef = useRef(false);
  const stopScanRef = useRef<() => void>(() => {});

  // Redirect if no user info
  useEffect(() => {
    if (!userInfo.firstName && !userInfo.lastName) {
      navigate('/', { replace: true });
    }
  }, [userInfo, navigate]);

  // Start camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error(err);
        setError(
          'Unable to access camera. Please allow camera access and reload.'
        );
      }
    }
    startCamera();
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const updateDisplayRect = useCallback(() => {
    setDisplayRect(getVideoDisplayRect(videoRef.current));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateDisplayRect);
    return () => window.removeEventListener('resize', updateDisplayRect);
  }, [updateDisplayRect]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    const maxWidth = 960;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  }, []);

  const analyzeFrame = useCallback(async () => {
    const image = captureFrame();
    if (!image) return;

    analyzingRef.current = true;
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, userInfo }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = (await response.json()) as { fields?: FieldBox[] };
      const detected = data.fields || [];
      setFields(detected);
      setInstruction(
        detected.length > 0
          ? buildInstruction(detected)
          : 'No matching empty fields found. Keep the form steady.'
      );
    } catch (err) {
      console.error(err);
      setInstruction('Could not read the page. Please try again.');
    } finally {
      analyzingRef.current = false;
    }
  }, [captureFrame, userInfo]);

  const startReading = useCallback(() => {
    setIsReading(true);
    setTimeLeft(READ_DURATION_SECONDS);
    setInstruction('Looking for form fields...');

    // Run once immediately
    analyzeFrame();

    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          setIsReading(false);
          setFields([]);
          setInstruction('Reading finished. Press Read to scan again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const captureId = window.setInterval(() => {
      if (!analyzingRef.current) {
        analyzeFrame();
      }
    }, CAPTURE_INTERVAL_MS);

    stopScanRef.current = () => {
      window.clearInterval(timerId);
      window.clearInterval(captureId);
      analyzingRef.current = false;
      setIsReading(false);
      setTimeLeft(READ_DURATION_SECONDS);
      setFields([]);
      setInstruction('Point camera at a form and press Read');
    };
  }, [analyzeFrame]);

  const stopReading = useCallback(() => {
    stopScanRef.current();
  }, []);

  useEffect(() => {
    return () => {
      stopScanRef.current();
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const hasFields = fields.length > 0;

  return (
    <div className="read-page">
      <div
        className={`instruction-banner ${isReading ? 'instruction-banner--visible' : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {instruction}
      </div>

      {!isReading && (
        <div className="read-hint" role="note">
          <p>Point your camera at a blank form, then press Read.</p>
        </div>
      )}

      {isReading && !hasFields && (
        <div className="read-hint" role="note">
          <p>Hold steady while the form is read...</p>
        </div>
      )}

      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
          aria-label="Camera preview"
          onLoadedMetadata={updateDisplayRect}
        />
        {displayRect && (
          <div
            className="camera-overlay"
            aria-hidden={!isReading}
            style={{
              left: displayRect.x,
              top: displayRect.y,
              width: displayRect.width,
              height: displayRect.height,
            }}
          >
            {fields.map((field, idx) => (
              <div
                key={`${field.fieldName}-${idx}`}
                className="field-box"
                style={{
                  left: `${field.box[0] * 100}%`,
                  top: `${field.box[1] * 100}%`,
                  width: `${(field.box[2] - field.box[0]) * 100}%`,
                  height: `${(field.box[3] - field.box[1]) * 100}%`,
                }}
              >
                <Pencil className="field-box-icon" aria-hidden="true" />
                <span className="field-box-label">{field.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="read-controls">
        {isReading ? (
          <button
            type="button"
            className="big-button stop-button"
            onClick={stopReading}
            aria-label="Stop reading form"
          >
            Stop ({formatTime(timeLeft)} left)
          </button>
        ) : (
          <button
            type="button"
            className="big-button read-button"
            onClick={startReading}
            aria-label="Start reading form"
          >
            Read
          </button>
        )}
      </div>
    </div>
  );
}

function buildInstruction(fields: FieldBox[]): string {
  if (fields.length === 0) return '';
  if (fields.length === 1) {
    const { label, value } = fields[0];
    return `Write "${value}" in ${label}`;
  }
  const firstThree = fields.slice(0, 3);
  return firstThree.map(({ label, value }) => `${label}: ${value}`).join('  •  ');
}
