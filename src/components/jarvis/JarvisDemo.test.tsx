import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import JarvisDemo from "./JarvisDemo";

describe("JarvisDemo", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
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

  it("continua a consulta após repetir o mesmo cenário antes do primeiro avanço", async () => {
    vi.useFakeTimers();
    const { container } = render(<JarvisDemo />);
    const scenario = screen.getByRole("button", { name: /Onde preciso agir hoje/i });

    fireEvent.click(scenario);
    await act(async () => vi.advanceTimersByTimeAsync(100));
    fireEvent.click(scenario);
    await act(async () => vi.advanceTimersByTimeAsync(400));

    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "consulting");
    await act(async () => vi.advanceTimersByTimeAsync(1_500));
    await act(async () => vi.advanceTimersByTimeAsync(1_800));
    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "approval");
  });

  it("cancela o avanço anterior quando a pergunta sai do escopo durante uma consulta", async () => {
    vi.useFakeTimers();
    const { container } = render(<JarvisDemo />);
    fireEvent.click(screen.getByRole("button", { name: /Onde preciso agir hoje/i }));
    await act(async () => vi.advanceTimersByTimeAsync(400));
    fireEvent.change(screen.getByLabelText("Pergunta para o Minino Jarvis"), {
      target: { value: "Qual será o clima amanhã?" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await act(async () => vi.advanceTimersByTimeAsync(5_000));

    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "unsupported");
    expect(screen.queryByText("Prioridade encontrada")).not.toBeInTheDocument();
  });

  it("devolve foco e rolagem às perguntas ao reiniciar no celular", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("innerWidth", 390);
    const { container } = render(<JarvisDemo />);
    const control = container.querySelector<HTMLElement>(".jarvis-control")!;
    const conversation = container.querySelector<HTMLElement>(".jarvis-experience")!;
    control.scrollIntoView = vi.fn();
    conversation.scrollIntoView = vi.fn();
    fireEvent.change(screen.getByLabelText("Pergunta para o Minino Jarvis"), {
      target: { value: "Qual será o clima amanhã?" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await act(async () => vi.advanceTimersByTimeAsync(20));

    fireEvent.click(screen.getByRole("button", { name: "Ver perguntas disponíveis" }));
    await act(async () => vi.advanceTimersByTimeAsync(20));

    expect(container.querySelector(".jarvis-demo")).toHaveAttribute("data-step", "idle");
    expect(screen.getByRole("button", { name: /Onde preciso agir hoje/i })).toHaveFocus();
    expect(control.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it.each([
    { locale: "pt-BR" as const, button: "Escrever mensagem", input: "Pergunta para o Minino Jarvis", notice: "simulação local" },
    { locale: "en" as const, button: "Write a message", input: "Question for Minino Jarvis", notice: "local simulation" }
  ])("leva a barra de mensagem ao input real em $locale", ({ locale, button, input, notice }) => {
    render(<JarvisDemo locale={locale} />);
    const questionInput = screen.getByLabelText(input);
    questionInput.scrollIntoView = vi.fn();

    fireEvent.click(screen.getByRole("button", { name: button }));

    expect(questionInput).toHaveFocus();
    expect(questionInput.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(screen.getByText(notice, { exact: true })).toBeVisible();
    expect(screen.queryByText(/^(canal seguro ativo|secure channel active|online pelo WhatsApp|online on WhatsApp)$/)).not.toBeInTheDocument();
  });

  it("foca o input sem rolagem animada com movimento reduzido", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<JarvisDemo />);
    const questionInput = screen.getByLabelText("Pergunta para o Minino Jarvis");
    questionInput.scrollIntoView = vi.fn();

    fireEvent.click(screen.getByRole("button", { name: "Escrever mensagem" }));

    expect(questionInput).toHaveFocus();
    expect(questionInput.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "center" });
  });
});
