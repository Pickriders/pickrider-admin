/**
 * A short two-tone chime for URGENT staff alerts, synthesised with the Web Audio API so the admin
 * ships no sound file. Browsers only allow audio after the page has had a user gesture; until then
 * (or where Web Audio is missing) this quietly does nothing and the sticky toast carries the alert.
 */
type AudioCtor = typeof AudioContext;

let context: AudioContext | null = null;
let lastPlayedAt = 0;

/** Notes (Hz) and timing for the chime: a rising fifth, about 0.6s in all. */
export const CHIME_NOTES = [
  { frequency: 880, start: 0, length: 0.22 },
  { frequency: 1318.5, start: 0.18, length: 0.42 },
] as const;

/** Repeats inside this window are dropped so a burst of alerts is one sound, not a din. */
export const CHIME_COOLDOWN_MS = 4_000;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext) as AudioCtor | undefined;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  return context;
}

export function playUrgentChime(now = Date.now()): boolean {
  if (now - lastPlayedAt < CHIME_COOLDOWN_MS) return false;
  try {
    const ctx = audioContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    const t0 = ctx.currentTime + 0.02;
    for (const note of CHIME_NOTES) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.frequency, t0 + note.start);
      // Soft attack and an exponential tail so it reads as a bell, not a beep.
      gain.gain.setValueAtTime(0.0001, t0 + note.start);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.start + note.length);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + note.start);
      osc.stop(t0 + note.start + note.length + 0.05);
    }
    lastPlayedAt = now;
    return true;
  } catch {
    return false;
  }
}

/** Test seam: forget the shared context and the cooldown. */
export function resetChime() {
  context = null;
  lastPlayedAt = 0;
}
