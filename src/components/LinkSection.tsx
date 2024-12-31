import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
}

function LinkButton({ href, children }: LinkButtonProps) {
  return (
    <a
      href={href}
      className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-[#ff9900] to-[#ff6b00] text-white text-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(255,153,0,0.4)] active:translate-y-0"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ExternalLink className="w-5 h-5" />
    </a>
  );
}

export function LinkSection() {
  return (
    <div className="space-y-4 mb-8">
      <LinkButton href="https://drive.google.com/drive/folders/1G1Tl5k01EDlUSDRx_sbuIUY5P14pHytz?usp=sharing">
        Acesse nossos templates
      </LinkButton>
      <LinkButton href="https://drive.google.com/drive/folders/13CFux9alUBxCOZBA2U3erz_Mi_OiUlta?usp=drive_link">
        Acesse nossos prompts
      </LinkButton>
      <LinkButton href="https://youtube.com/@oleonardocandiani?si=dV5nPL7bhpM9d_ah">
        📲 Inscreva-se no canal
      </LinkButton>
      <LinkButton href="https://tally.so/r/wvqD4Q">
        Aplicar para feedback ou trabalhos
      </LinkButton>
    </div>
  );
}