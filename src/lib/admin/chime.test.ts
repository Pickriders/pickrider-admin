/**
 * @jest-environment jsdom
 */
import { CHIME_COOLDOWN_MS, CHIME_NOTES, playUrgentChime, resetChime } from "./chime";

type Param = { setValueAtTime: jest.Mock; exponentialRampToValueAtTime: jest.Mock };
const param = (): Param => ({ setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() });

let oscillators: { frequency: Param; start: jest.Mock; stop: jest.Mock; connect: jest.Mock; type: string }[] = [];
let resume: jest.Mock;

class FakeAudioContext {
  state = "suspended";
  currentTime = 10;
  destination = {};
  constructor() {
    resume = jest.fn(() => Promise.resolve());
    this.resume = resume;
  }
  resume: jest.Mock;
  createOscillator() {
    const osc = { frequency: param(), start: jest.fn(), stop: jest.fn(), connect: jest.fn(), type: "" };
    oscillators.push(osc);
    return osc;
  }
  createGain() {
    return { gain: param(), connect: jest.fn() };
  }
}

describe("urgent chime", () => {
  beforeEach(() => {
    resetChime();
    oscillators = [];
    (window as unknown as { AudioContext?: unknown }).AudioContext = FakeAudioContext;
  });

  it("synthesises the two-tone chime and wakes a suspended context", () => {
    expect(playUrgentChime(100_000)).toBe(true);
    expect(oscillators).toHaveLength(CHIME_NOTES.length);
    expect(oscillators.map((osc) => osc.frequency.setValueAtTime.mock.calls[0][0])).toEqual(CHIME_NOTES.map((note) => note.frequency));
    expect(oscillators.every((osc) => osc.start.mock.calls.length === 1 && osc.stop.mock.calls.length === 1)).toBe(true);
    expect(resume).toHaveBeenCalled();
  });

  it("plays once per burst: repeats inside the cooldown are dropped", () => {
    expect(playUrgentChime(100_000)).toBe(true);
    expect(playUrgentChime(100_000 + CHIME_COOLDOWN_MS - 1)).toBe(false);
    expect(oscillators).toHaveLength(CHIME_NOTES.length);
    expect(playUrgentChime(100_000 + CHIME_COOLDOWN_MS)).toBe(true);
    expect(oscillators).toHaveLength(CHIME_NOTES.length * 2);
  });

  it("does nothing, without throwing, where Web Audio is missing", () => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    expect(playUrgentChime(100_000)).toBe(false);
  });
});
