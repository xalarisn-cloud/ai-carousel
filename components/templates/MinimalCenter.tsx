import React from 'react';
import { TemplateProps } from '../../types';

const MinimalCenter: React.FC<TemplateProps> = ({ slide, logo, ctaText, instagramHandle, swipeText, slideIndex, theme }) => {
    const isDarkNeon = theme === 'dark-neon';

    return (
        <div className="w-full h-full flex flex-col justify-between items-center p-8 sm:p-12 md:p-16 text-center relative">
            {logo && <img src={logo} alt="Logo" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-16 sm:w-20 h-auto" />}

            <div className="flex-grow flex flex-col justify-center items-center">
                <h1
                    className={`font-montserrat font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight ${isDarkNeon ? 'text-[#3cf0f0]' : ''}`}
                    style={isDarkNeon ? { textShadow: '0 0 10px #3cf0f0, 0 0 20px #3cf0f0' } : {}}
                >
                    {slide.title}
                </h1>
                <p className={`mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl ${isDarkNeon ? 'text-[#ff4fd8]' : 'text-gray-200'}`}>
                    {slide.description}
                </p>
            </div>
            
            <div className="w-full flex justify-between items-center text-xs sm:text-sm md:text-base">
                <div className={`${isDarkNeon ? 'text-[#ff4fd8]' : ''}`}>{ctaText} | {instagramHandle}</div>
                {slideIndex < 9 && <div className={`animate-pulse ${isDarkNeon ? 'text-[#3cf0f0]' : ''}`}>{swipeText}</div>}
            </div>
        </div>
    );
};

export default MinimalCenter;