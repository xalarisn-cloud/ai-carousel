import React from 'react';
import { SlideContent, Theme, Template } from '../types';
import MinimalCenter from './templates/MinimalCenter';
import CardOverlay from './templates/CardOverlay';
import SplitLeftImage from './templates/SplitLeftImage';
import BigNumberSteps from './templates/BigNumberSteps';
import GridAccents from './templates/GridAccents';

interface SlideContainerProps {
    slide: SlideContent;
    slideIndex: number;
    theme: Theme;
    template: Template;
    logo: string | null;
    ctaText: string;
    ctaLink: string;
    instagramHandle: string;
    swipeText: string;
    backgroundImage: string | null;
    isForExport: boolean;
}

const TEMPLATES_MAP: { [key in Template]: React.FC<any> } = {
    'minimal-center': MinimalCenter,
    'card-overlay': CardOverlay,
    'split-left-image': SplitLeftImage,
    'big-number-steps': BigNumberSteps,
    'grid-accents': GridAccents,
};

const THEME_STYLES: { [key in Theme]: { gradient: string; textClass?: string } } = {
    'blue-tech': { gradient: 'from-[#0b2c4f] to-[#203a67]' },
    'purple-neon': { gradient: 'from-[#4b2dbf] to-[#9c5fff]' },
    'sunset-glow': { gradient: 'from-[#ff6b00] to-[#ffb347]' },
    'dark-neon': { gradient: 'from-[#0a0a0a] to-[#1c1f26]' },
};

const SlideContainer: React.FC<SlideContainerProps> = (props) => {
    const { template, theme, backgroundImage } = props;
    const TemplateComponent = TEMPLATES_MAP[template];
    const themeStyle = THEME_STYLES[theme];

    const isSplitTemplate = template === 'split-left-image';

    const backgroundStyle: React.CSSProperties = (backgroundImage && !isSplitTemplate)
        ? {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }
        : {};
    
    const sizeClass = props.isForExport ? 'w-[1080px] h-[1080px]' : 'w-full h-full';

    return (
        <div
            className={`${sizeClass} flex relative text-white font-poppins bg-gradient-to-br ${themeStyle.gradient} transition-all duration-500 overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.4)]`}
            style={backgroundStyle}
        >
            {/* Blur + Gradient Overlay */}
            <div className="absolute inset-0 w-full h-full backdrop-blur bg-gradient-to-b from-black/40 to-black/60 z-0"></div>
            
            {/* Content must be on top of the overlay */}
            <div className="relative z-10 w-full h-full">
                <TemplateComponent {...props} />
            </div>
        </div>
    );
};

export default SlideContainer;