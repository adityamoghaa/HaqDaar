// useAudioPlayback — manages PCM audio queue and playback via Web Audio API
import { useRef, useCallback } from "react";

/**
 * Plays raw PCM audio chunks (24kHz, 16-bit, mono) received from Gemini Live API.
 * Maintains a queue to handle sequential playback and supports interruption.
 */
export default function useAudioPlayback() {
  const audioContextRef = useRef(null);
  const queueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }
    }
    // Resume if suspended (autoplay policy)
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Convert base64 PCM to Float32Array
   */
  const decodePCM = useCallback((base64Data) => {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // 16-bit little-endian PCM to Float32
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    return float32;
  }, []);

  /**
   * Play next chunk from queue
   */
  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const chunk = queueRef.current.shift();
    const ctx = getAudioContext();

    const audioBuffer = ctx.createBuffer(1, chunk.length, 24000);
    audioBuffer.getChannelData(0).set(chunk);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    currentSourceRef.current = source;

    source.onended = () => {
      currentSourceRef.current = null;
      playNext();
    };

    source.start();
  }, [getAudioContext]);

  /**
   * Queue a base64 PCM audio chunk for playback
   */
  const enqueueAudio = useCallback(
    (base64Data) => {
      const pcm = decodePCM(base64Data);
      queueRef.current.push(pcm);

      if (!isPlayingRef.current) {
        playNext();
      }
    },
    [decodePCM, playNext]
  );

  /**
   * Clear audio queue and stop current playback (for interruptions)
   */
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {}
      currentSourceRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);

  /**
   * Clean up audio context
   */
  const cleanup = useCallback(() => {
    clearQueue();
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  }, [clearQueue]);

  return {
    enqueueAudio,
    clearQueue,
    cleanup,
    get isPlaying() {
      return isPlayingRef.current;
    },
  };
}
