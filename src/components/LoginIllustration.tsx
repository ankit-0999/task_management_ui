import React from 'react';

export function LoginIllustration({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="hidden lg:flex w-1/2 bg-[#7199D6] text-white flex-col justify-center items-center relative overflow-hidden">
      {/* Decorative Wavy Zig-Zag Blob as requested in history */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path fill="currentColor" d="M0,0 C30,20 20,40 50,50 C80,60 70,80 100,100 L0,100 Z" />
        <path fill="currentColor" d="M100,0 C70,20 80,40 50,50 C20,60 30,80 0,100 L100,100 Z" opacity="0.5" />
      </svg>
      
      <div className="relative z-10 p-12 max-w-lg text-center">
        <div className="mb-8 inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-blue-50 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}
