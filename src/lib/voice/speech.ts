export type SpeechStatus = "idle" | "listening" | "understanding" | "searching" | "collaborating" | "complete";
export type SpeechToText = { supported: boolean; start: (onTranscript: (text: string) => void) => void; stop: () => void };
export type TextToSpeech = { supported: boolean; speak: (text: string) => void; stop: () => void };

type RecognitionConstructor = new () => SpeechRecognition;
type SpeechRecognition = EventTarget & { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: SpeechRecognitionEvent) => void) | null };
type SpeechRecognitionEvent = Event & { results: { length: number; [index: number]: { [index: number]: { transcript: string } } } };

export function createBrowserSpeechToText(): SpeechToText {
  if (typeof window === "undefined") return unsupportedStt;
  const Constructor = (window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;
  if (!Constructor) return unsupportedStt;
  let recognition: SpeechRecognition | undefined;
  return { supported: true, start(onTranscript) { recognition = new Constructor(); recognition.continuous = false; recognition.interimResults = true; recognition.lang = "en-US"; recognition.onresult = (event) => onTranscript(event.results[event.results.length - 1][0].transcript); recognition.start(); }, stop() { recognition?.stop(); } };
}
export function createBrowserTextToSpeech(): TextToSpeech { return typeof window === "undefined" || !("speechSynthesis" in window) ? unsupportedTts : { supported: true, speak(text) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }, stop() { window.speechSynthesis.cancel(); } }; }
const unsupportedStt: SpeechToText = { supported: false, start() {}, stop() {} };
const unsupportedTts: TextToSpeech = { supported: false, speak() {}, stop() {} };
