import React from 'react';
import { TemplateProps } from '../../types';

const SplitLeftImage: React.FC<TemplateProps> = ({ slide, logo, ctaText, instagramHandle, swipeText, slideIndex, theme, backgroundImage }) => {
    const isDarkNeon = theme === 'dark-neon';

    const bgImageStyle: React.CSSProperties = backgroundImage
        ? {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        : {};

    return (
        <div className="w-full h-full flex flex-col md:flex-row relative">
            {logo && <img src={logo} alt="Logo" className="absolute top-6 left-6 sm:top-8 sm:left-8 w-16 sm:w-20 h-auto z-20" />}
            
            {/* Image Side - Stacks on mobile, side-by-side on desktop */}
            <div className="w-full h-2/5 md:w-2/5 md:h-full" style={bgImageStyle}>
                 <div className="w-full h-full bg-black/20"></div>
            </div>

            {/* Text Side */}
            <div className={`w-full h-3/5 md:w-3/5 md:h-full flex flex-col justify-between p-8 md:p-12 ${isDarkNeon ? 'bg-[#0a0a0a]' : 'bg-[#1a1a1a]'}`}>
                <div className="flex-grow flex flex-col justify-center">
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
                <div className="w-full flex justify-between items-center text-xs sm:text-sm">
                    <div className={`${isDarkNeon ? 'text-[#ff4fd8]' : ''}`}>{ctaText} | {instagramHandle}</div>
                    {slideIndex < 9 && <div className={`animate-pulse ${isDarkNeon ? 'text-[#3cf0f0]' : ''}`}>{swipeText}</div>}
                </div>
            </div>
        </div>
    );
};

export default SplitLeftImage;