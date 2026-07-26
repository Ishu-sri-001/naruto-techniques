"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createVisionEngine } from "@/lib/vision/visionEngine";
import { GestureEngine } from "@/lib/gestures/gestureEngine";
import { shadowCloneGesture } from "@/lib/gestures/shadowClone";
import { rasenganGesture } from "@/lib/gestures/rasengan";
import { ShadowCloneEffect } from "@/lib/effects/shadowCloneEffect";
import { RasenganEffect } from "@/lib/effects/rasenganEffect";
import HandSealDiagram from "@/components/HandSealDiagram";

const GESTURES = [shadowCloneGesture, rasenganGesture];

function drawHud(ctx, width, height, { holding, holdingLabel, progress, lastTrigger, now }) {
  ctx.save();

  // The canvas is displayed through a parent CSS scaleX(-1) mirror (selfie
  // view), which would flip HUD text backwards. Pre-mirror here so the two
  // flips cancel and text reads normally on screen.
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  if (holding) {
    const barWidth = width * 0.34;
    const barHeight = Math.max(10, height * 0.018);
    const x = (width - barWidth) / 2;
    const y = height * 0.74;
    ctx.fillStyle = "rgba(10, 10, 10, 0.45)";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "rgba(255, 150, 40, 0.95)";
    ctx.fillRect(x, y, barWidth * Math.min(progress, 1), barHeight);
    ctx.font = `${Math.round(height * 0.022)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "center";
    ctx.fillText(holdingLabel || "Holding…", width / 2, y - height * 0.015);
  }

  const sinceTrigger = now - lastTrigger.at;
  if (sinceTrigger < 2200) {
    const alpha = sinceTrigger < 1600 ? 1 : Math.max(0, 1 - (sinceTrigger - 1600) / 600);
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(height * 0.05)}px sans-serif`;
    ctx.lineWidth = Math.max(2, height * 0.004);
    ctx.strokeStyle = `rgba(30, 20, 0, ${alpha})`;
    ctx.fillStyle = `rgba(255, 210, 90, ${alpha})`;
    ctx.strokeText(lastTrigger.name, width / 2, height * 0.12);
    ctx.fillText(lastTrigger.name, width / 2, height * 0.12);
  }

  ctx.restore();
}

export default function CameraStage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let stream = null;
    let engine = null;
    let rafId = null;
    let cancelled = false;

    const gestureEngine = new GestureEngine(GESTURES);
    const shadowCloneEffect = new ShadowCloneEffect();
    const rasenganEffect = new RasenganEffect();
    const lastTrigger = { name: "", at: -Infinity };

    async function start() {
      setStatus("requesting");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(
          err?.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera permission and reload to begin."
            : `Could not access the camera (${err?.message || "unknown error"}).`
        );
        setStatus("error");
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      if (cancelled) return;

      setStatus("loading-models");
      try {
        engine = await createVisionEngine();
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(`Could not load the hand-tracking model (${err?.message || "unknown error"}).`);
        setStatus("error");
        return;
      }
      if (cancelled) return;

      setStatus("ready");
      const canvas = canvasRef.current;

      const loop = () => {
        if (cancelled) return;
        const currentVideo = videoRef.current;

        if (currentVideo && currentVideo.readyState >= 2 && currentVideo.videoWidth) {
          if (canvas.width !== currentVideo.videoWidth || canvas.height !== currentVideo.videoHeight) {
            canvas.width = currentVideo.videoWidth;
            canvas.height = currentVideo.videoHeight;
          }

          const now = performance.now();
          const { hands, personMask } = engine.detect(currentVideo, now);
          const { triggered, holding, holdingLabel, progress } = gestureEngine.update(hands.landmarks, now);

          if (triggered === shadowCloneGesture.id) {
            shadowCloneEffect.spawn(now);
            lastTrigger.name = shadowCloneGesture.subtitle;
            lastTrigger.at = now;
          } else if (triggered === rasenganGesture.id) {
            rasenganEffect.trigger(now, hands.landmarks);
            lastTrigger.name = rasenganGesture.name;
            lastTrigger.at = now;
          }
          shadowCloneEffect.update(now, currentVideo, personMask);
          rasenganEffect.update(now, hands.landmarks);

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          shadowCloneEffect.render(ctx, canvas.width, canvas.height, now);
          rasenganEffect.render(ctx, canvas.width, canvas.height, now);
          drawHud(ctx, canvas.width, canvas.height, { holding, holdingLabel, progress, lastTrigger, now });
        }

        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
    }

    start();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      engine?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Camera feed + tracking overlay, mirrored together for a natural selfie view */}
      <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {/* Chrome overlay — not mirrored, sits above the camera */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-zinc-100 backdrop-blur-sm transition-colors hover:bg-black/70 sm:left-6 sm:top-6"
      >
        ← Home
      </Link>

      <div className="absolute right-4 top-4 z-20 flex w-44 flex-col items-stretch gap-3 rounded-2xl bg-black/50 p-3 backdrop-blur-sm sm:right-6 sm:top-6 sm:w-52">
        <div className="flex flex-col items-center text-center">
          <HandSealDiagram className="h-14 w-14 sm:h-16 sm:w-16" />
          <p className="text-2xl leading-none">
            <span role="img" aria-label="two fingers up">🤞</span>
            <span className="mx-1 text-sm text-zinc-500">+</span>
            <span role="img" aria-label="two fingers sideways" className="inline-block rotate-90">🤞</span>
          </p>
          <p className="mt-1 text-xs font-semibold text-orange-300">Kage Bunshin</p>
          <p className="text-[11px] text-zinc-400">Cross both hands at a right angle, a finger or two raised</p>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex flex-col items-center text-center">
          <p className="text-2xl leading-none">
            <span role="img" aria-label="clenched fist">✊</span>
            <span className="mx-1 text-sm text-zinc-500">→</span>
            <span role="img" aria-label="open palm">🖐️</span>
          </p>
          <p className="mt-1 text-xs font-semibold text-orange-300">Rasengan</p>
          <p className="text-[11px] text-zinc-400">Fist, then open palm face-up</p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pb-8 pt-16 text-center sm:pb-10">
        <div className="mx-auto max-w-xl">
          <div className="h-5 text-sm text-zinc-300">
            {status === "idle" && "Preparing camera…"}
            {status === "requesting" && "Requesting camera access…"}
            {status === "loading-models" && "Loading hand-tracking model…"}
            {status === "error" && <span className="text-red-400">{errorMessage}</span>}
            {status === "ready" && "Camera ready"}
          </div>
          <p className="mt-1 text-sm text-zinc-300 sm:text-base">
            Cross both hands at a right angle, with a finger or two raised on each
            (top right), for a shadow clone, or clench one fist and then open that
            palm face-up to channel a Rasengan above it.
          </p>
        </div>
      </div>
    </div>
  );
}
