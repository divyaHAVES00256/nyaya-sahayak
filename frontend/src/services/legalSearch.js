/**
 * Ask the backend to answer a legal question using retrieved FAQ evidence.
 * The Vite development proxy forwards this relative URL to the Python API.
 */
export async function answerLegalQuestion(question) {
  const response = await fetch("/api/v1/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, limit: 3 }),
  });

  // Convert API/network failures into readable errors for the chat screen.
  if (!response.ok) {
    let message = `Answer request failed (${response.status}).`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) message = errorBody.detail;
    } catch {
      // Keep the status message when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Send a recorded microphone clip to the backend's local Whisper model.
 */
export async function transcribeSpeech(blob) {
  const formData = new FormData();
  formData.append("audio", blob, "voice-question.webm");

  const response = await fetch("/api/v1/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = `Speech transcription failed (${response.status}).`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) message = errorBody.detail;
    } catch {
      // Keep the status message when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response.json();
}
