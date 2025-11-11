import React from 'react';
import { TemplateProps } from '../../types';

const GridAccents: React.FC<TemplateProps> = ({ slide, slideIndex, logo, ctaText, instagramHandle, swipeText, theme }) => {
    const isDarkNeon = theme === 'dark-neon';
    const accentColor = isDarkNeon ? 'border-pink-500/50' : 'border-white/20';

    return (
        <div className="w-full h-full flex flex-col p-6 sm:p-8 md:p-10 relative">
            {/* Grid Accents */}
            <div className={`absolute top-0 left-0 w-full h-full border ${accentColor} grid grid-cols-4 grid-rows-4`}>
                {[...Array(16)].map((_, i) => <div key={i} className={`border ${accentColor}`}></div>)}
            </div>
            {/* Dot Accent */}
             <div className="absolute top-4 right-4 grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => <div key={i} className={`w-1 h-1 rounded-full ${isDarkNeon ? 'bg-[#3cf0f0]' : 'bg-white/50'}`}></div>)}
            </div>


            <header className="relative z-10">
                {logo && <img src={logo} alt="Logo" className="w-16 sm:w-20 h-auto" />}
            </header>
            
            <main className="flex-grow flex flex-col justify-center relative z-10">
                <div className="bg-black/10 p-4 sm:p-6">
                    <h1
                        className={`font-montserrat font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight ${isDarkNeon ? 'text-[#3cf0f0]' : ''}`}
                        style={isDarkNeon ? { textShadow: '0 0 8px #3cf0f0' } : {}}
                    >
                        {slide.title}
                    </h1>
                    <p className={`mt-3 sm:mt-5 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl ${isDarkNeon ? 'text-[#ff4fd8]' : 'text-gray-200'}`}>
                        {slide.description}
                    </p>
                </div>
            </main>
            
            <footer className="w-full flex justify-between items-center text-xs sm:text-sm relative z-10">
                <div className={`${isDarkNeon ? 'text-[#ff4fd8]' : ''}`}>{ctaText} | {instagramHandle}</div>
                {slideIndex < 9 && <div className={`animate-pulse ${isDarkNeon ? 'text-[#3cf0f0]' : ''}`}>{swipeText}</div>}
            </footer>
        </div>
    );
};

export default GridAccents;