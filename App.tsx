// FIX: Removed an invalid <script> tag from the top of this file. It is not valid syntax in a TSX file and was causing parsing errors.
import React, { useState, useRef, useEffect } from 'react';
import { SlideContent, Theme, Template } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import CarouselPreview from './components/CarouselPreview';
import { DownloadIcon, UploadIcon } from './components/icons/ActionIcons';
import { generateCarouselContent } from './services/geminiService';

declare global {
    interface Window {
        htmlToImage: any;
        JSZip: any;
        saveAs: (blob: Blob, filename: string) => void;
    }
}

const App: React.FC = () => {
    const [slides, setSlides] = useLocalStorage<SlideContent[]>('carousel-slides', [
        { title: 'Ο Τίτλος του Καρουζέλ σας', description: 'Δώστε ένα θέμα για να δημιουργήσει η AI το περιεχόμενό σας.' },
        { title: 'Προσαρμόστε το Στυλ', description: 'Αλλάξτε το θέμα, το πρότυπο και προσθέστε το λογότυπό σας.' },
        { title: 'Τελική Πρόταση Δράσης', description: 'Επεξεργαστείτε το CTA και κατεβάστε το τελικό αποτέλεσμα.' },
    ]);
    const [theme, setTheme] = useLocalStorage<Theme>('carousel-theme', 'blue-tech');
    const [template, setTemplate] = useLocalStorage<Template>('carousel-template', 'minimal-center');
    const [logo, setLogo] = useLocalStorage<string | null>('carousel-logo', null);
    const [ctaText, setCtaText] = useLocalStorage('carousel-ctaText', 'Μάθε Περισσότερα');
    const [ctaLink, setCtaLink] = useLocalStorage('carousel-ctaLink', 'yourlink.com');
    const [instagramHandle, setInstagramHandle] = useLocalStorage('carousel-instagramHandle', '@yourhandle');
    const [swipeText, setSwipeText] = useLocalStorage('carousel-swipeText', 'Σύρε Αριστερά →');
    const [backgroundImage, setBackgroundImage] = useLocalStorage<string | null>('carousel-backgroundImage', null);
    
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    
    useEffect(() => {
      slideRefs.current = slides.map((_, i) => slideRefs.current[i] ?? null);
    }, [slides]);


    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateCarousel = async () => {
        if (!topic.trim()) {
            setError("Παρακαλώ εισάγετε ένα θέμα.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const newSlides = await generateCarouselContent(topic);
            setSlides(newSlides);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Η δημιουργία του καρουζέλ απέτυχε.';
            setError(errorMessage);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };


    const handleDownloadZip = async () => {
        const { htmlToImage, JSZip, saveAs } = window;

        if (!htmlToImage || !JSZip || !saveAs) {
            setError("Λείπουν οι απαραίτητες βιβλιοθήκες για τη λήψη.");
            console.error("html-to-image, jszip, or file-saver not found on window object");
            return;
        }

        setIsDownloading(true);
        setError(null);
        setDownloadSuccess(false);

        try {
            const zip = new JSZip();
            const slug = slides[0].title.toLowerCase().replace(/[^a-z0-9\u0370-\u03ff]+/g, '-').replace(/^-+|-+$/g, '');
            
            await document.fonts.ready;

            for (let i = 0; i < slides.length; i++) {
                const node = slideRefs.current[i];
                if (node && node.firstChild) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    const dataUrl = await htmlToImage.toPng(node.firstChild as HTMLElement, {
                        pixelRatio: 2,
                        width: 1080,
                        height: 1080,
                        backgroundColor: '#0b2c4f',
                    });
                    
                    const cleanDataUrl = dataUrl.split(',')[1];
                    if (cleanDataUrl) {
                        const slideNumber = String(i + 1).padStart(2, '0');
                        zip.file(`carousel_${slug}_slide${slideNumber}.png`, cleanDataUrl, { base64: true });
                    } else {
                         throw new Error(`Αποτυχία δημιουργίας εικόνας για το slide ${i + 1}`);
                    }
                } else {
                    console.warn(`Slide container not found for slide ${i + 1}. Skipping.`);
                }
            }
            
            const content = await zip.generateAsync({ type: 'blob' });
            
            saveAs(content, `carousel_${slug || 'download'}.zip`);
            
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 4000);

        } catch (e) {
            setError(e instanceof Error ? e.message : 'Η λήψη των slides απέτυχε.');
            console.error(e);
        } finally {
            setIsDownloading(false);
        }
    };

    const themeOptions: { value: Theme, label: string }[] = [
        { value: 'blue-tech', label: 'Blue Tech' },
        { value: 'purple-neon', label: 'Purple Neon' },
        { value: 'sunset-glow', label: 'Sunset Glow' },
        { value: 'dark-neon', label: 'Dark Neon' },
    ];
    
    const templateOptions: { value: Template, label: string }[] = [
        { value: 'minimal-center', label: 'Minimal Center' },
        { value: 'card-overlay', label: 'Card Overlay' },
        { value: 'split-left-image', label: 'Split Left Image' },
        { value: 'big-number-steps', label: 'Big Number Steps' },
        { value: 'grid-accents', label: 'Grid Accents' },
    ];
    
    const inputStyles = "w-full bg-[#0a0a0a] border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition disabled:opacity-50";
    const labelStyles = "block text-sm font-medium text-gray-300 mb-2";
    const buttonStyles = "w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none";

    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black font-montserrat tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">AI Carousel Builder</span>
                    </h1>
                    <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Δημιούργησε εντυπωσιακά καρουζέλ για το Instagram σε δευτερόλεπτα.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 xl:col-span-1 bg-[#1c1f26] p-6 rounded-2xl shadow-lg h-fit lg:sticky top-8">
                        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-3">Επεξεργασία</h2>
                        
                        <div className="space-y-6">
                             <div>
                                <h3 className="text-lg font-bold mb-4">1. Δώσε το Θέμα σου</h3>
                                <div className="space-y-4">
                                     <textarea
                                        id="topic"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="π.χ., 5 συμβουλές για καλύτερη παραγωγικότητα"
                                        className={`${inputStyles} h-24`}
                                        disabled={isLoading}
                                    />
                                    <button onClick={handleGenerateCarousel} disabled={isLoading || !topic.trim()} className={buttonStyles}>
                                        {isLoading ? 'Δημιουργία...' : 'Δημιουργία με AI'}
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="text-lg font-bold mb-4">2. Στυλ & Branding</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="theme" className={labelStyles}>Θέμα Χρωμάτων</label>
                                        <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value as Theme)} className={inputStyles}>
                                            {themeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="template" className={labelStyles}>Πρότυπο</label>
                                        <select id="template" value={template} onChange={(e) => setTemplate(e.target.value as Template)} className={inputStyles}>
                                            {templateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelStyles}>Εικόνα Φόντου</label>
                                        <label htmlFor="bg-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-600 hover:border-cyan-400 p-4 rounded-lg transition text-gray-400 hover:text-white">
                                            <UploadIcon />
                                            <span>{backgroundImage ? 'Αλλαγή Εικόνας' : 'Ανέβασμα Εικόνας'}</span>
                                        </label>
                                        <input id="bg-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleBackgroundImageUpload} />
                                    </div>
                                    <div>
                                        <label className={labelStyles}>Λογότυπο</label>
                                        <label htmlFor="logo-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-600 hover:border-cyan-400 p-4 rounded-lg transition text-gray-400 hover:text-white">
                                            <UploadIcon />
                                            <span>{logo ? 'Αλλαγή Λογότυπου' : 'Ανέβασμα Λογότυπου'}</span>
                                        </label>
                                        <input id="logo-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoUpload} />
                                        {logo && <img src={logo} alt="logo preview" className="mt-2 h-10 w-auto bg-white/10 p-1 rounded" />}
                                   </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="text-lg font-bold mb-4">3. Κείμενα & CTA</h3>
                                <div className="space-y-4">
                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="ctaText" className={labelStyles}>CTA Κείμενο</label>
                                            <input id="ctaText" type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputStyles} />
                                        </div>
                                        <div>
                                            <label htmlFor="instagramHandle" className={labelStyles}>Instagram</label>
                                            <input id="instagramHandle" type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} className={inputStyles} />
                                        </div>
                                   </div>
                                     <div>
                                        <label htmlFor="swipeText" className={labelStyles}>Κείμενο Swipe</label>
                                        <input id="swipeText" type="text" value={swipeText} onChange={(e) => setSwipeText(e.target.value)} className={inputStyles} />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-6">
                                <button onClick={handleDownloadZip} disabled={isDownloading || slides.length === 0} className={`${buttonStyles} bg-pink-600 hover:bg-pink-700`}>
                                    <div className="flex items-center justify-center gap-2">
                                        <DownloadIcon />
                                        {isDownloading ? 'Λήψη...' : 'Κατέβασε Καρουζέλ (ZIP)'}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </aside>
                    
                    <div className="lg:col-span-2 xl:col-span-3">
                        <CarouselPreview 
                           slides={slides}
                           theme={theme}
                           template={template}
                           logo={logo}
                           ctaText={ctaText}
                           ctaLink={ctaLink}
                           instagramHandle={instagramHandle}
                           swipeText={swipeText}
                           backgroundImage={backgroundImage}
                           slideRefs={slideRefs}
                           isLoading={isLoading}
                        />
                         {error && <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg text-center">{error}</div>}
                    </div>
                </div>
                {downloadSuccess && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600/95 text-white font-bold py-3 px-6 rounded-lg shadow-lg z-50 animate-bounce">
                        📦 Το καρουζέλ κατέβηκε επιτυχώς!
                    </div>
                )}
            </main>
            
            <div className="fixed top-[-9999px] left-[-9999px] opacity-100 block">
                {slides.map((_, index) => (
                    <div key={`export-${index}`} ref={el => slideRefs.current[index] = el} style={{ width: 1080, height: 1080 }}>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;