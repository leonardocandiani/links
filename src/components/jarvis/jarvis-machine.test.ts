import { describe, expect, it } from "vitest";

import { jarvisInitialStep, jarvisReducer, jarvisStepOrder } from "./jarvis-machine";

describe("jarvisReducer", () => {
  it("percorre a sequência aprovada até a confirmação", () => {
    expect(jarvisInitialStep).toBe("idle");
    expect(jarvisStepOrder).toEqual([
      "idle",
      "question",
      "consulting",
      "answering",
      "approval",
      "executing",
      "success"
    ]);

    const question = jarvisReducer(jarvisInitialStep, { type: "START" });
    const consulting = jarvisReducer(question, { type: "CONSULT" });
    const answering = jarvisReducer(consulting, { type: "ANSWER" });
    const approval = jarvisReducer(answering, { type: "REQUEST_APPROVAL" });
    const executing = jarvisReducer(approval, { type: "AUTHORIZE" });
    const success = jarvisReducer(executing, { type: "COMPLETE" });

    expect(question).toBe("question");
    expect(consulting).toBe("consulting");
    expect(answering).toBe("answering");
    expect(approval).toBe("approval");
    expect(executing).toBe("executing");
    expect(success).toBe("success");
  });
});
