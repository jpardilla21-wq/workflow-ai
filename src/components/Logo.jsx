import React from 'react';

export default function Logo({ size = 'default' }) {
  const sizes = {
    small: { height: 'h-8' },
    default: { height: 'h-10' },
    large: { height: 'h-16' }
  };

  const s = sizes[size];

  return (
    <img 
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69777a5de57184bc90f04118/71c1adcb8_Gemini_Generated_Image_gz8tfpgz8tfpgz8t.png"
      alt="Workflow AI Logo"
      className={`${s.height} object-contain`}
    />
  );
}