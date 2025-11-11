
export interface SlideContent {
  title: string;
  description: string;
}

export type Theme = 'blue-tech' | 'purple-neon' | 'sunset-glow' | 'dark-neon';

export type Template = 'minimal-center' | 'card-overlay' | 'split-left-image' | 'big-number-steps' | 'grid-accents';

export interface TemplateProps {
  slide: SlideContent;
  slideIndex: number;
  logo: string | null;
  ctaText: string;
  ctaLink: string;
  instagramHandle: string;
  swipeText: string;
  theme: Theme;
  backgroundImage: string | null;
}
