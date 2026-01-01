declare module 'bidi-js' {
  const bidiFactory: () => {
    getReorderedString: (str: string, embedLevelsResult?: any, start?: number, end?: number) => string;
  };
  export default bidiFactory;
}

declare module 'arabic-persian-reshaper' {
  export const ArabicShaper: {
    convertArabic: (text: string) => string;
    convertArabicBack?: (text: string) => string;
  };
  export const PersianShaper: {
    convertArabic: (text: string) => string;
    convertArabicBack?: (text: string) => string;
  };
}


