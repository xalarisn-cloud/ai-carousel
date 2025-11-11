<script src="https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js"></script>
import React, { useState, useRef, useEffect } from 'react';
import { SlideContent, Theme, Template } from './types';
import { generateCarouselContent, generateBackgroundImage, editBackgroundImage } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';
import CarouselPreview from './components/CarouselPreview';
import { DownloadIcon, UploadIcon } from './components/icons/ActionIcons';

declare global {
    interface Window {
        htmlToImage: any;
        JSZip: any;
        saveAs: (blob: Blob, filename: string) => void;
    }
}


const App: React.FC = () => {
    const [topic, setTopic] = useLocalStorage('carousel-topic', '10 Τρόποι για να Βελτιώσετε την Παραγωγικότητά σας');
    const [slides, setSlides] = useLocalStorage<SlideContent[]>('carousel-slides', [
        { title: 'Δημιουργός Carousel με AI!', description: 'Δώσε ένα θέμα και πάτα "Δημιουργία" για να φτιάξεις το καρουζέλ σου για το Instagram.' },
        { title: 'Προσάρμοσε την Εμφάνιση', description: 'Διάλεξε ανάμεσα σε διάφορα θέματα και πρότυπα για να ταιριάζει με το brand σου.' },
        { title: 'Πρόσθεσε το Branding σου', description: 'Ανέβασε το λογότυπό σου και βάλε το Instagram handle σου.' },
        { title: 'Κατέβασέ το & Μοιράσου το', description: 'Εξαγωγή όλων των slides ως εικόνες PNG σε ένα αρχείο ZIP.' },
    ]);
    // The useLocalStorage hook automatically saves the theme choice across sessions.
    const [theme, setTheme] = useLocalStorage<Theme>('carousel-theme', 'blue-tech');
    // The useLocalStorage hook automatically saves the template choice across sessions.
    const [template, setTemplate] = useLocalStorage<Template>('carousel-template', 'minimal-center');
    const [logo, setLogo] = useLocalStorage<string | null>('carousel-logo', null);
    const [ctaText, setCtaText] = useLocalStorage('carousel-ctaText', 'Μάθε Περισσότερα');
    const [ctaLink, setCtaLink] = useLocalStorage('carousel-ctaLink', 'yourlink.com');
    const [instagramHandle, setInstagramHandle] = useLocalStorage('carousel-instagramHandle', '@yourhandle');
    const [swipeText, setSwipeText] = useLocalStorage('carousel-swipeText', 'Σύρε Αριστερά →');
    const [backgroundImage, setBackgroundImage] = useLocalStorage<string | null>('carousel-backgroundImage', null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditingImage, setIsEditingImage] = useState(false);

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
    
    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("Παρακαλώ εισάγετε ένα θέμα.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const [newSlides, newBgBase64] = await Promise.all([
                generateCarouselContent(topic),
                generateBackgroundImage(topic)
            ]);
            
            if (newSlides && newSlides.length > 0) {
                 setSlides(newSlides);
            } else {
                throw new Error("Το AI δεν επέστρεψε slides.");
            }
           
            setBackgroundImage(`data:image/png;base64,${newBgBase64}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Προέκυψε άγνωστο σφάλμα κατά τη δημιουργία.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditImage = async () => {
        if (!editPrompt.trim() || !backgroundImage) {
            setError("Παρακαλώ γράψτε μια οδηγία και βεβαιωθείτε ότι υπάρχει εικόνα.");
            return;
        }
        setIsEditingImage(true);
        setError(null);
        try {
            const newBgBase64 = await editBackgroundImage(backgroundImage, editPrompt);
            setBackgroundImage(`data:image/png;base64,${newBgBase64}`);
            setEditPrompt('');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Η επεξεργασία της εικόνας απέτυχε.');
            console.error(e);
        } finally {
            setIsEditingImage(false);
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
            const slug = topic.toLowerCase().replace(/[^a-z0-9\u0370-\u03ff]+/g, '-').replace(/^-+|-+$/g, '');
            
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
    
    const inputStyles = "w-full bg-[#0a0a0a] border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition";
    const labelStyles = "block text-sm font-medium text-gray-300 mb-2";
    const buttonStyles = "w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none";

    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black font-montserrat tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">AI Carousel Generator</span>
                    </h1>
                    <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Δημιούργησε εντυπωσιακά καρουζέλ για το Instagram σε δευτερόλεπτα με τη δύναμη του Gemini AI.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 xl:col-span-1 bg-[#1c1f26] p-6 rounded-2xl shadow-lg h-fit lg:sticky top-8">
                        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-3">Ρυθμίσεις</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="topic" className={labelStyles}>Θέμα</label>
                                <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={`${inputStyles} h-24`} placeholder="π.χ. 10 συμβουλές για απομακρυσμένη εργασία" />
                            </div>

                            <button onClick={handleGenerate} disabled={isLoading} className={buttonStyles}>
                                {isLoading ? 'Δημιουργία...' : 'Δημιουργία Καρουζέλ'}
                            </button>

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
                                <label className={labelStyles}>Λογότυπο</label>
                                <label htmlFor="logo-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-600 hover:border-cyan-400 p-4 rounded-lg transition text-gray-400 hover:text-white">
                                    <UploadIcon />
                                    <span>{logo ? 'Αλλαγή Λογότυπου' : 'Ανέβασμα Λογότυπου'}</span>
                                </label>
                                <input id="logo-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoUpload} />
                                {logo && <img src={logo} alt="logo preview" className="mt-2 h-10 w-auto bg-white/10 p-1 rounded" />}
                           </div>

                           {backgroundImage && (
                                <div className="border-t border-gray-700 pt-6">
                                    <h3 className="text-lg font-bold mb-3">✨ Επεξεργασία Εικόνας AI</h3>
                                    <img src={backgroundImage} alt="Background Preview" className="rounded-lg mb-4 w-full" />
                                    <label htmlFor="editPrompt" className={labelStyles}>Οδηγία Επεξεργασίας</label>
                                    <textarea
                                        id="editPrompt"
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        className={`${inputStyles} h-20`}
                                        placeholder="π.χ. Πρόσθεσε ένα vintage φίλτρο"
                                        disabled={isEditingImage}
                                    />
                                    <button onClick={handleEditImage} disabled={isEditingImage || !editPrompt.trim()} className={`${buttonStyles} mt-3`}>
                                        {isEditingImage ? 'Επεξεργασία...' : 'Εφαρμογή Αλλαγής'}
                                    </button>
                                </div>
                            )}
                           
                           <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-6">
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

                            <button onClick={handleDownloadZip} disabled={isDownloading || slides.length === 0} className={`${buttonStyles} bg-pink-600 hover:bg-pink-700`}>
                                <div className="flex items-center justify-center gap-2">
                                    <DownloadIcon />
                                    {isDownloading ? 'Λήψη...' : 'Κατέβασε Καρουζέλ (ZIP)'}
                                </div>
                            </button>
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