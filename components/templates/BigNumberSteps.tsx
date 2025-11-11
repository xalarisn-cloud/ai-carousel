import React from 'react';
import { TemplateProps } from '../../types';

const BigNumberSteps: React.FC<TemplateProps> = ({ slide, slideIndex, logo, ctaText, instagramHandle, swipeText, theme }) => {
    const isDarkNeon = theme === 'dark-neon';
    const number = String(slideIndex + 1).padStart(2, '0');

    return (
        <div className="w-full h-full flex flex-col justify-between items-start p-8 sm:p-10 md:p-12 relative">
            {logo && <img src={logo} alt="Logo" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-16 sm:w-20 h-auto" />}

            <div className="flex-grow flex flex-col justify-center relative w-full">
                <span 
                    className={`absolute -top-2 sm:-top-4 left-0 font-montserrat font-black text-7xl sm:text-8xl md:text-9xl opacity-10 ${isDarkNeon ? 'text-[#3cf0f0]' : 'text-white'}`}
                    style={isDarkNeon ? { WebkitTextStroke: '2px #3cf0f0' } : { WebkitTextStroke: '2px white' }}
                >
                    {number}
                </span>
                <div className="mt-12 sm:mt-16 md:mt-20">
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

export default BigNumberSteps;