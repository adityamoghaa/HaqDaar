// Gemini Live API Service — WebSocket session manager
// Handles real-time bidirectional audio streaming with Gemini
import { getEphemeralToken } from "./ephemeralToken";

const LIVE_MODEL = "gemini-3.1-flash-live-preview";
const LIVE_WS_BASE = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

const SYSTEM_INSTRUCTION = `You are HaqDaar, a friendly and empathetic AI assistant helping Indian citizens discover government schemes they qualify for.

You speak naturally in whatever language the user uses — Hindi, English, Hinglish, Tamil, Telugu, Bengali, Marathi, or any Indian language.

Your conversational style:
- Warm, respectful, simple — like a helpful neighbor
- Say "namaste" or greetings in the user's language
- Never use bureaucratic jargon
- Keep responses concise (2-3 sentences max for voice)

Your job during the conversation:
1. Listen to the user describe their situation
2. Ask gentle follow-up questions to learn: where they live (state), what they do (occupation), their age, family situation, income range, caste category
3. After 2-3 exchanges, when you have enough information, call the match_schemes function with the extracted profile
4. Never ask more than 3 questions total

Income interpretation: "80 hazaar" = ₹80,000/year, "2 lakh" = ₹200,000/year
Occupation mapping: kisan/farmer/kheti = farmer, student/padhai = student, majduri = daily_wage
State mapping: UP/Lucknow = UP, Mumbai/Maharashtra = MH, Chennai/Tamil Nadu = TN`;

/**
 * Creates and manages a Gemini Live API WebSocket session.
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.onAudio - Called with base64 PCM audio chunks from AI
 * @param {Function} callbacks.onInputTranscript - Called with user speech transcript
 * @param {Function} callbacks.onOutputTranscript - Called with AI speech transcript
 * @param {Function} callbacks.onInterrupted - Called when user interrupts AI
 * @param {Function} callbacks.onToolCall - Called with function call from AI
 * @param {Function} callbacks.onError - Called with error
 * @param {Function} callbacks.onStateChange - Called with session state changes
 * @returns {Object} Session controller
 */
export function createLiveSession(callbacks = {}) {
  let ws = null;
  let isSetupComplete = false;
  let sessionId = null;

  const state = {
    connected: false,
    destroyed: false,
  };

  async function connect() {
    if (state.destroyed) return;
    callbacks.onStateChange?.("connecting");

    try {
      const token = await getEphemeralToken();
      const url = `${LIVE_WS_BASE}?access_token=${token}`;

      ws = new WebSocket(url);

      ws.onopen = () => {
        // Send setup message
        const setupMsg = {
          setup: {
            model: `models/${LIVE_MODEL}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede",
                  },
                },
              },
            },
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            tools: [
              {
                functionDeclarations: [
                  {
                    name: "match_schemes",
                    description:
                      "Match government schemes based on the user's profile. Call this when you have gathered enough information about the user (at least state + occupation or income).",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        state: {
                          type: "STRING",
                          description: "Indian state abbreviation (UP, MH, TN, RJ, WB, etc.)",
                        },
                        age: { type: "NUMBER", description: "User's age" },
                        gender: {
                          type: "STRING",
                          enum: ["male", "female"],
                          description: "User's gender",
                        },
                        occupation: {
                          type: "STRING",
                          enum: ["farmer", "student", "daily_wage", "self_employed", "unemployed", "retired"],
                          description: "User's occupation category",
                        },
                        income: {
                          type: "NUMBER",
                          description: "Annual income in rupees",
                        },
                        caste: {
                          type: "STRING",
                          enum: ["SC", "ST", "OBC", "general", "minority"],
                          description: "Caste/social category",
                        },
                        bpl: { type: "BOOLEAN", description: "Has BPL card" },
                        area: {
                          type: "STRING",
                          enum: ["rural", "urban"],
                          description: "Rural or urban area",
                        },
                      },
                      required: ["state", "occupation"],
                    },
                  },
                ],
              },
            ],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        };

        ws.send(JSON.stringify(setupMsg));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch (err) {
          console.error("[Live] Failed to parse message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[Live] WebSocket error:", err);
        callbacks.onError?.(new Error("WebSocket connection error"));
        callbacks.onStateChange?.("error");
      };

      ws.onclose = (event) => {
        state.connected = false;
        isSetupComplete = false;
        if (!state.destroyed) {
          callbacks.onStateChange?.("disconnected");
        }
      };
    } catch (err) {
      callbacks.onError?.(err);
      callbacks.onStateChange?.("error");
    }
  }

  function handleMessage(msg) {
    // Setup complete
    if (msg.setupComplete) {
      isSetupComplete = true;
      state.connected = true;
      callbacks.onStateChange?.("connected");
      return;
    }

    // Server content (audio, transcriptions)
    if (msg.serverContent) {
      const content = msg.serverContent;

      // Audio output — process ALL parts in each event
      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          if (part.inlineData) {
            callbacks.onAudio?.(part.inlineData.data, part.inlineData.mimeType);
          }
        }
      }

      // Input transcription (what user said)
      if (content.inputTranscription?.text) {
        callbacks.onInputTranscript?.(content.inputTranscription.text);
      }

      // Output transcription (what AI said)
      if (content.outputTranscription?.text) {
        callbacks.onOutputTranscript?.(content.outputTranscription.text);
      }

      // Interruption
      if (content.interrupted === true) {
        callbacks.onInterrupted?.();
      }

      // Turn complete
      if (content.turnComplete) {
        callbacks.onStateChange?.("idle");
      }
    }

    // Tool call (function calling)
    if (msg.toolCall) {
      const { functionCalls } = msg.toolCall;
      if (functionCalls) {
        for (const call of functionCalls) {
          callbacks.onToolCall?.(call.name, call.args, call.id);
        }
      }
    }

    // Go away signal
    if (msg.goAway) {
      console.warn("[Live] GoAway signal received, session ending soon");
    }
  }

  /**
   * Send audio data (raw PCM, 16kHz, 16-bit, mono)
   * @param {string} base64Audio - Base64 encoded PCM audio
   */
  function sendAudio(base64Audio) {
    if (!ws || ws.readyState !== WebSocket.OPEN || !isSetupComplete) return;
    ws.send(
      JSON.stringify({
        realtimeInput: {
          mediaChunks: [
            {
              data: base64Audio,
              mimeType: "audio/pcm;rate=16000",
            },
          ],
        },
      })
    );
  }

  /**
   * Send text input
   * @param {string} text
   */
  function sendText(text) {
    if (!ws || ws.readyState !== WebSocket.OPEN || !isSetupComplete) return;
    ws.send(
      JSON.stringify({
        realtimeInput: {
          text: text,
        },
      })
    );
  }

  /**
   * Send tool response (for function calling)
   */
  function sendToolResponse(callId, result) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        toolResponse: {
          functionResponses: [
            {
              id: callId,
              name: "match_schemes",
              response: result,
            },
          ],
        },
      })
    );
  }

  /**
   * Signal end of audio stream (for Hybrid VAD)
   */
  function sendAudioStreamEnd() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        realtimeInput: {
          audioStreamEnd: true,
        },
      })
    );
  }

  /**
   * Disconnect and clean up
   */
  function disconnect() {
    state.destroyed = true;
    if (ws) {
      try { ws.close(); } catch {}
      ws = null;
    }
  }

  return {
    connect,
    sendAudio,
    sendText,
    sendToolResponse,
    sendAudioStreamEnd,
    disconnect,
    get isConnected() { return state.connected; },
  };
}
