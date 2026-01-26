import React from 'react';

export default function Logo({ size = 'default' }) {
  const sizes = {
    small: { height: 'h-8' },
    default: { height: 'h-10' },
    large: { height: 'h-16' }
  };

  const s = sizes[size];

  return null;
}