import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import JarvisDemo from "./JarvisDemo";

describe("JarvisDemo", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("inicia a conversa a partir de uma pergunta escolhida", () => {
    const { container } = render(<JarvisDemo />);

    fireEvent.click(screen.getByRole("button", { name: /Onde preciso agir hoje/i }));

    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "question");
    expect(screen.getByText("Como está nossa operação hoje e onde preciso agir primeiro?")).toBeVisible();
  });

  it("pede autorização e confirma a execução", async () => {
    vi.useFakeTimers();
    const { container } = render(<JarvisDemo />);

    fireEvent.click(screen.getByRole("button", { name: /Onde preciso agir hoje/i }));
    await act(async () => vi.advanceTimersByTimeAsync(400));
    await act(async () => vi.advanceTimersByTimeAsync(1_500));
    await act(async () => vi.advanceTimersByTimeAsync(1_800));

    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "approval");
    expect(screen.getByRole("button", { name: "Autorizar ação" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Autorizar ação" }));
    await act(async () => vi.advanceTimersByTimeAsync(1_500));

    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "success");
    expect(screen.getByText("Contatos distribuídos, gestores avisados e acompanhamento criado.")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Fazer outra pergunta" }));
    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "idle");
  });
});
