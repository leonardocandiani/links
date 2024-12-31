import React from 'react';

export function Hero() {
  return (
    <div className="text-center mb-8">
      <div className="relative w-32 h-32 mx-auto mb-6">
        <img
          src="https://yt3.googleusercontent.com/wRazIgaM9GtarKA--iuVTbTZIcj8CfApOH3jRDHHtdyE-TuZFYbhJ23eK3cmHQbNZTGTl6U2=s160-c-k-c0x00ffffff-no-rj"
          alt="Leonardo Candiani"
          className="rounded-full w-full h-full object-cover border-2 border-[#ff9900] shadow-lg"
        />
        <div className="absolute inset-0 rounded-full shadow-inner"></div>
      </div>
      <h1 className="text-5xl font-semibold gradient-text mb-4 tracking-tight">
        Leonardo Candiani
      </h1>
      <p className="text-xl text-white/80 font-light">
        Especialista em Automação Low-Code e IA
      </p>
    </div>
  );
}