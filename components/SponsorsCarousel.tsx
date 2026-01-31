
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Sponsor } from '../types';

export const SponsorsCarousel: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    const load = () => {
        setSponsors(db.getSponsors());
    };
    load();
    window.addEventListener('radio-settings-update', load);
    return () => window.removeEventListener('radio-settings-update', load);
  }, []);

  if (sponsors.length === 0) return null;

  return (
    <div className="bg-white py-8 border-t border-gray-100 overflow-hidden relative">
        <div className="container mx-auto px-4 mb-6 text-center">
             <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Nossos Parceiros</h3>
             <div className="w-16 h-1 bg-yellow-400 mx-auto mt-2"></div>
        </div>

        {/* Infinite Scroll Container */}
        <div className="relative w-full overflow-hidden flex">
             {/* Keyframes for smooth scrolling defined via style tag to avoid complex tailwind config */}
             <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .sponsor-track {
                    display: flex;
                    width: max-content;
                    animation: scroll 30s linear infinite;
                }
                .sponsor-track:hover {
                    animation-play-state: paused;
                }
             `}</style>

             <div className="sponsor-track gap-12 px-6">
                {/* Render Double List for infinite loop effect */}
                {[...sponsors, ...sponsors].map((sponsor, index) => (
                    <a 
                        key={`${sponsor.id}-${index}`} 
                        href={sponsor.externalUrl || '#'} 
                        target={sponsor.externalUrl ? "_blank" : "_self"}
                        rel="noreferrer"
                        className={`block w-40 h-24 flex-shrink-0 grayscale hover:grayscale-0 transition duration-300 transform hover:scale-110 flex items-center justify-center ${!sponsor.externalUrl ? 'cursor-default pointer-events-none' : ''}`}
                        title={sponsor.name}
                    >
                        <img 
                            src={sponsor.imageUrl} 
                            alt={sponsor.name} 
                            className="max-w-full max-h-full object-contain drop-shadow-sm" 
                        />
                    </a>
                ))}
             </div>
        </div>
    </div>
  );
};
