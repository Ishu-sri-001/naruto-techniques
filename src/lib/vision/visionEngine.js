import {
  FilesetResolver,
  HandLandmarker,
  ImageSegmenter,
} from "@mediapipe/tasks-vision";

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

const HAND_LANDMARKER_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const SELFIE_SEGMENTER_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite";

/**
 * Loads the MediaPipe hand landmark and selfie segmentation models and
 * exposes a single per-frame `detect` call. Both models run in VIDEO mode,
 * which requires a strictly increasing timestamp per call.
 */
export async function createVisionEngine() {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);

  const [handLandmarker, imageSegmenter] = await Promise.all([
    HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: HAND_LANDMARKER_MODEL,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    }),
    ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: SELFIE_SEGMENTER_MODEL,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    }),
  ]);

  let closed = false;

  return {
    /**
     * Runs both models against the current video frame.
     * @param {HTMLVideoElement} videoEl
     * @param {number} timestampMs strictly increasing timestamp in ms
     * @returns {{ hands: { landmarks: any[][], handedness: any[][] }, personMask: { data: Float32Array, width: number, height: number } | null }}
     */
    detect(videoEl, timestampMs) {
      if (closed) return { hands: { landmarks: [], handedness: [] }, personMask: null };

      const handResult = handLandmarker.detectForVideo(videoEl, timestampMs);

      let personMask = null;
      const segResult = imageSegmenter.segmentForVideo(videoEl, timestampMs);
      const mask = segResult.confidenceMasks && segResult.confidenceMasks[0];
      if (mask) {
        personMask = {
          data: mask.getAsFloat32Array(),
          width: mask.width,
          height: mask.height,
        };
      }
      segResult.close?.();

      return {
        hands: {
          landmarks: handResult.landmarks ?? [],
          handedness: handResult.handedness ?? [],
        },
        personMask,
      };
    },

    close() {
      closed = true;
      handLandmarker.close();
      imageSegmenter.close();
    },
  };
}
