/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { CodeInput, digitsOf } from "./code-input";

describe("digitsOf", () => {
  it("keeps only digits and cuts to the code length", () => {
    expect(digitsOf("123 456")).toBe("123456");
    expect(digitsOf("12-34-56-78")).toBe("123456");
    expect(digitsOf("abc")).toBe("");
    expect(digitsOf("1234", 4)).toBe("1234");
  });
});

/** Six boxes: typing fills and advances, Backspace steps back, a paste fills everything and completes. */
describe("CodeInput", () => {
  let container: HTMLDivElement;
  let root: Root;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function Harness({ onComplete }: { onComplete?: (code: string) => void }) {
    const [value, setValue] = React.useState("");
    return (
      <>
        <CodeInput value={value} onChange={setValue} onComplete={onComplete} />
        <output data-testid="value">{value}</output>
      </>
    );
  }

  const inputs = () => Array.from(container.querySelectorAll("input")) as HTMLInputElement[];
  const value = () => container.querySelector("[data-testid='value']")?.textContent;

  const type = (index: number, text: string) => {
    const input = inputs()[index];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    act(() => {
      setter?.call(input, text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  it("renders six numeric boxes", () => {
    act(() => root.render(<Harness />));
    expect(inputs()).toHaveLength(6);
    expect(inputs().every((i) => i.getAttribute("inputmode") === "numeric")).toBe(true);
    expect(inputs()[0].getAttribute("autocomplete")).toBe("one-time-code");
  });

  it("typing a digit fills the box and moves focus to the next one", () => {
    act(() => root.render(<Harness />));
    act(() => inputs()[0].focus());
    type(0, "4");
    expect(value()).toBe("4");
    expect(document.activeElement).toBe(inputs()[1]);
    type(1, "2");
    expect(value()).toBe("42");
    expect(document.activeElement).toBe(inputs()[2]);
    expect(inputs()[0].value).toBe("4");
    expect(inputs()[1].value).toBe("2");
  });

  it("ignores letters", () => {
    act(() => root.render(<Harness />));
    type(0, "a");
    expect(value()).toBe("");
  });

  it("Backspace on an empty box clears the previous digit and steps back", () => {
    act(() => root.render(<Harness />));
    type(0, "1");
    type(1, "2");
    act(() => {
      inputs()[2].dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }));
    });
    expect(value()).toBe("1");
    expect(document.activeElement).toBe(inputs()[1]);
  });

  it("a pasted code with spaces fills every box and completes", () => {
    const onComplete = jest.fn();
    act(() => root.render(<Harness onComplete={onComplete} />));
    const event = new Event("paste", { bubbles: true, cancelable: true }) as Event & { clipboardData: { getData: () => string } };
    Object.defineProperty(event, "clipboardData", { value: { getData: () => "123 456" } });
    act(() => {
      inputs()[0].dispatchEvent(event);
    });
    expect(value()).toBe("123456");
    expect(inputs().map((i) => i.value).join("")).toBe("123456");
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("completes once the sixth digit is typed", () => {
    const onComplete = jest.fn();
    act(() => root.render(<Harness onComplete={onComplete} />));
    "987654".split("").forEach((digit, index) => type(index, digit));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("987654");
  });
});
