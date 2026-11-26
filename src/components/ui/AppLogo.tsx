import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  forceDark?: boolean;
}

/**
 * Official seqoy brand mark.
 * Automatically switches between primary (light bg) and dark-mode (dark bg)
 * transparent exports with zero drop shadows or outer glows per BRAND_GUIDELINES.md.
 */
export default function AppLogo({ size = 34, className = '', forceDark = false }: AppLogoProps) {
  const height = Math.max(32, size);

  if (forceDark) {
    return (
      <img
        src="/brand/seqoy-logo-dark-transparent.png"
        alt="seqoy"
        style={{ height, width: 'auto' }}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  return (
    <>
      <img
        src="/brand/seqoy-logo-primary-transparent.png"
        alt="seqoy"
        style={{ height, width: 'auto' }}
        className={`block dark:hidden object-contain select-none ${className}`}
      />
      <img
        src="/brand/seqoy-logo-dark-transparent.png"
        alt="seqoy"
        style={{ height, width: 'auto' }}
        className={`hidden dark:block object-contain select-none ${className}`}
      />
    </>
  );
}
