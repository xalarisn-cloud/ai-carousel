import React, { useEffect } from 'react';
import { SlideContent, Theme, Template } from './types';
import SlideContainer from './components/SlideContainer';

interface CarouselPreviewProps {
    slides: SlideContent[];
    theme: Theme;
    template: Template;
    logo: string | null;
    ctaText: string;
    ctaLink: string;
    instagramHandle: string;
    swipeText: string;
    backgroundImage: string | null;
    slideRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
    isLoading: boolean;
}

const CarouselPreview: React.FC<CarouselPreviewProps> = ({
    slides,
    theme,
    template,
    logo,
    ctaText,
    ctaLink,
    instagramHandle,
    swipeText,
    backgroundImage,
    slideRefs,
    isLoading,
}) => {

    const commonProps = {
        logo,
        ctaText,
        ctaLink,
        instagramHandle,
        swipeText,
        theme,
        backgroundImage,
        template,
    };
    
    // Populate hidden divs for export
    useEffect(() => {
        slideRefs.current.forEach((ref, index) => {
            if (ref) {
                // We need to use ReactDOM to portal the content into the hidden divs
                // to maintain context and styles, but for simplicity here we'll just
                // re-render them. Note: For a more complex app, a portal approach would be better.
                const ReactDOM = (window as any).ReactDOM;
                if (ReactDOM && ReactDOM.createRoot) {
                    const root = ReactDOM.createRoot(ref);
                    root.render(
                        <SlideContainer {...commonProps} slide={slides[index]} slideIndex={index} isForExport={true} />
                    );
                }
            }
        });
    }, [slides, theme, template, logo, ctaText, ctaLink, instagramHandle, swipeText, backgroundImage, commonProps, slideRefs]);


    return (
        <div className="w-full space-y-8 rounded-lg">
            {isLoading ? (
                <div className="w-full h-full bg-black/30 flex flex-col items-center justify-center rounded-2xl aspect-square">
                     <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
                     <p className="mt-4 text-lg">Η AI δημιουργεί...</p>
                </div>
            ) : (
                slides.map((slide, index) => (
                    <div key={`preview-${index}`}>
                        <p className="font-bold text-lg mb-2 text-gray-300">Slide {index + 1}</p>
                        <div className="aspect-square w-full shadow-2xl rounded-2xl overflow-hidden">
                             <SlideContainer 
                                {...commonProps} 
                                slide={slide} 
                                slideIndex={index}
                                isForExport={false}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default CarouselPreview;