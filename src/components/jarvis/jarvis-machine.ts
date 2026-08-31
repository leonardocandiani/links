export type JarvisStep =
  | "idle"
  | "question"
  | "consulting"
  | "answering"
  | "approval"
  | "executing"
  | "success"
  | "unsupported";

export type JarvisEvent =
  | { type: "START" }
  | { type: "CONSULT" }
  | { type: "ANSWER" }
  | { type: "REQUEST_APPROVAL" }
  | { type: "AUTHORIZE" }
  | { type: "COMPLETE" }
  | { type: "UNSUPPORTED" }
  | { type: "RESET" };

export const jarvisInitialStep: JarvisStep = "idle";

export const jarvisStepOrder = [
  "idle",
  "question",
  "consulting",
  "answering",
  "approval",
  "executing",
  "success"
] as const satisfies readonly JarvisStep[];

export function jarvisReducer(step: JarvisStep, event: JarvisEvent): JarvisStep {
  switch (event.type) {
    case "RESET":
      return jarvisInitialStep;
    case "START":
      return "question";
    case "CONSULT":
      return step === "question" ? "consulting" : step;
    case "ANSWER":
      return step === "consulting" ? "answering" : step;
    case "REQUEST_APPROVAL":
      return step === "answering" ? "approval" : step;
    case "AUTHORIZE":
      return step === "approval" ? "executing" : step;
    case "COMPLETE":
      return step === "executing" ? "success" : step;
    case "UNSUPPORTED":
      return "unsupported";
  }
}
