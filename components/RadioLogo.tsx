
import React, { useState, useEffect } from 'react';

interface RadioLogoProps {
  className?: string;
  src?: string;
}

export const RadioLogo: React.FC<RadioLogoProps> = ({ className = "w-40", src }) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state when src changes (e.g., when updating settings)
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // If we have a valid source and no error, show the Official Logo
  if (src && src.trim() !== "" && !imgError) {
    return (
      <img 
        src={src} 
        alt="Rádio 13 de Maio" 
        className={`${className} object-contain`} 
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback ONLY text, no more drawn logos.
  // This ensures the unwanted design never appears again.
  return (
    <div className={`${className} flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50/50`}>
        <span className="text-xs font-bold text-gray-400 text-center px-2">
            Rádio 13 de Maio<br/>
            (Sem Logo)
        </span>
    </div>
  );
};
