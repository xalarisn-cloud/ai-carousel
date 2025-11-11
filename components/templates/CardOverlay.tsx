import React from 'react';
import { TemplateProps } from '../../types';

const CardOverlay: React.FC<TemplateProps> = ({ slide, logo, ctaText, instagramHandle, swipeText, slideIndex, theme }) => {
    const isDarkNeon = theme === 'dark-neon';
    const cardBg = isDarkNeon ? 'bg-black/50 border border-pink-500/50' : 'bg-black/30 backdrop-blur-sm';

    return (
        <div className="w-full h-full flex flex-col justify-between items-start p-6 sm:p-8 md:p-12 relative">
            {logo && <img src={logo} alt="Logo" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-16 sm:w-20 h-auto z-10" />}

            <div className="flex-grow flex flex-col justify-center items-start w-full">
                <div className={`p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg ${cardBg}`}>
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
            </div>
            
            <div className="w-full flex justify-between items-center text-xs sm:text-sm">
                <div className={`${isDarkNeon ? 'text-[#ff4fd8]' : ''}`}>{ctaText} | {instagramHandle}</div>
                {slideIndex < 9 && <div className={`animate-pulse ${isDarkNeon ? 'text-[#3cf0f0]' : ''}`}>{swipeText}</div>}
            </div>
        </div>
    );
};

export default CardOverlay;