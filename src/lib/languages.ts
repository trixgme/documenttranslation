import type { Language } from "@/types";

export const LANGUAGES: Language[] = [
  // Popular
  { code: "en", name: "English", nativeName: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8", category: "popular" },
  { code: "ko", name: "Korean", nativeName: "\uD55C\uAD6D\uC5B4", flag: "\uD83C\uDDF0\uD83C\uDDF7", category: "popular" },
  { code: "ja", name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", flag: "\uD83C\uDDEF\uD83C\uDDF5", category: "popular" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "\u7B80\u4F53\u4E2D\u6587", flag: "\uD83C\uDDE8\uD83C\uDDF3", category: "popular" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "\u7E41\u9AD4\u4E2D\u6587", flag: "\uD83C\uDDF9\uD83C\uDDFC", category: "popular" },
  { code: "es", name: "Spanish", nativeName: "Espa\u00F1ol", flag: "\uD83C\uDDEA\uD83C\uDDF8", category: "popular" },
  { code: "fr", name: "French", nativeName: "Fran\u00E7ais", flag: "\uD83C\uDDEB\uD83C\uDDF7", category: "popular" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA", category: "popular" },

  // European
  { code: "pt", name: "Portuguese", nativeName: "Portugu\u00EAs", flag: "\uD83C\uDDF5\uD83C\uDDF9", category: "european" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "\uD83C\uDDEE\uD83C\uDDF9", category: "european" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "\uD83C\uDDF3\uD83C\uDDF1", category: "european" },
  { code: "ru", name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\uD83C\uDDF7\uD83C\uDDFA", category: "european" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "\uD83C\uDDF5\uD83C\uDDF1", category: "european" },
  { code: "uk", name: "Ukrainian", nativeName: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", flag: "\uD83C\uDDFA\uD83C\uDDE6", category: "european" },
  { code: "cs", name: "Czech", nativeName: "\u010Ce\u0161tina", flag: "\uD83C\uDDE8\uD83C\uDDFF", category: "european" },
  { code: "ro", name: "Romanian", nativeName: "Rom\u00E2n\u0103", flag: "\uD83C\uDDF7\uD83C\uDDF4", category: "european" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "\uD83C\uDDED\uD83C\uDDFA", category: "european" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "\uD83C\uDDF8\uD83C\uDDEA", category: "european" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "\uD83C\uDDE9\uD83C\uDDF0", category: "european" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "\uD83C\uDDEB\uD83C\uDDEE", category: "european" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "\uD83C\uDDF3\uD83C\uDDF4", category: "european" },
  { code: "el", name: "Greek", nativeName: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC", flag: "\uD83C\uDDEC\uD83C\uDDF7", category: "european" },
  { code: "bg", name: "Bulgarian", nativeName: "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438", flag: "\uD83C\uDDE7\uD83C\uDDEC", category: "european" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "\uD83C\uDDED\uD83C\uDDF7", category: "european" },
  { code: "sk", name: "Slovak", nativeName: "Sloven\u010Dina", flag: "\uD83C\uDDF8\uD83C\uDDF0", category: "european" },
  { code: "sl", name: "Slovenian", nativeName: "Sloven\u0161\u010Dina", flag: "\uD83C\uDDF8\uD83C\uDDEE", category: "european" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvi\u0173", flag: "\uD83C\uDDF1\uD83C\uDDF9", category: "european" },
  { code: "lv", name: "Latvian", nativeName: "Latvie\u0161u", flag: "\uD83C\uDDF1\uD83C\uDDFB", category: "european" },
  { code: "et", name: "Estonian", nativeName: "Eesti", flag: "\uD83C\uDDEA\uD83C\uDDEA", category: "european" },
  { code: "sr", name: "Serbian", nativeName: "\u0421\u0440\u043F\u0441\u043A\u0438", flag: "\uD83C\uDDF7\uD83C\uDDF8", category: "european" },

  // Asian
  { code: "hi", name: "Hindi", nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\uD83C\uDDEE\uD83C\uDDF3", category: "asian" },
  { code: "th", name: "Thai", nativeName: "\u0E44\u0E17\u0E22", flag: "\uD83C\uDDF9\uD83C\uDDED", category: "asian" },
  { code: "vi", name: "Vietnamese", nativeName: "Ti\u1EBFng Vi\u1EC7t", flag: "\uD83C\uDDFB\uD83C\uDDF3", category: "asian" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "\uD83C\uDDEE\uD83C\uDDE9", category: "asian" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "\uD83C\uDDF2\uD83C\uDDFE", category: "asian" },
  { code: "tl", name: "Filipino", nativeName: "Filipino", flag: "\uD83C\uDDF5\uD83C\uDDED", category: "asian" },
  { code: "bn", name: "Bengali", nativeName: "\u09AC\u09BE\u0982\u09B2\u09BE", flag: "\uD83C\uDDE7\uD83C\uDDE9", category: "asian" },
  { code: "ta", name: "Tamil", nativeName: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", flag: "\uD83C\uDDEE\uD83C\uDDF3", category: "asian" },
  { code: "te", name: "Telugu", nativeName: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", flag: "\uD83C\uDDEE\uD83C\uDDF3", category: "asian" },
  { code: "ur", name: "Urdu", nativeName: "\u0627\u0631\u062F\u0648", flag: "\uD83C\uDDF5\uD83C\uDDF0", category: "asian" },
  { code: "my", name: "Myanmar (Burmese)", nativeName: "\u1019\u103C\u1014\u103A\u1019\u102C\u1018\u102C\u101E\u102C", flag: "\uD83C\uDDF2\uD83C\uDDF2", category: "asian" },
  { code: "km", name: "Khmer", nativeName: "\u1781\u17D2\u1798\u17C2\u179A", flag: "\uD83C\uDDF0\uD83C\uDDED", category: "asian" },
  { code: "mn", name: "Mongolian", nativeName: "\u041C\u043E\u043D\u0433\u043E\u043B", flag: "\uD83C\uDDF2\uD83C\uDDF3", category: "asian" },

  // Middle Eastern
  { code: "ar", name: "Arabic", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\uD83C\uDDF8\uD83C\uDDE6", category: "middle-eastern" },
  { code: "he", name: "Hebrew", nativeName: "\u05E2\u05D1\u05E8\u05D9\u05EA", flag: "\uD83C\uDDEE\uD83C\uDDF1", category: "middle-eastern" },
  { code: "fa", name: "Persian", nativeName: "\u0641\u0627\u0631\u0633\u06CC", flag: "\uD83C\uDDEE\uD83C\uDDF7", category: "middle-eastern" },
  { code: "tr", name: "Turkish", nativeName: "T\u00FCrk\u00E7e", flag: "\uD83C\uDDF9\uD83C\uDDF7", category: "middle-eastern" },
  { code: "ku", name: "Kurdish", nativeName: "Kurd\u00EE", flag: "\uD83C\uDDEE\uD83C\uDDF6", category: "middle-eastern" },

  // African
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "\uD83C\uDDF0\uD83C\uDDEA", category: "african" },
  { code: "am", name: "Amharic", nativeName: "\u12A0\u121B\u122D\u129B", flag: "\uD83C\uDDEA\uD83C\uDDF9", category: "african" },
  { code: "ha", name: "Hausa", nativeName: "Hausa", flag: "\uD83C\uDDF3\uD83C\uDDEC", category: "african" },
  { code: "yo", name: "Yoruba", nativeName: "Yor\u00F9b\u00E1", flag: "\uD83C\uDDF3\uD83C\uDDEC", category: "african" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "\uD83C\uDDFF\uD83C\uDDE6", category: "african" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "\uD83C\uDDFF\uD83C\uDDE6", category: "african" },

  // Americas
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Portugu\u00EAs (Brasil)", flag: "\uD83C\uDDE7\uD83C\uDDF7", category: "americas" },
  { code: "ht", name: "Haitian Creole", nativeName: "Krey\u00F2l Ayisyen", flag: "\uD83C\uDDED\uD83C\uDDF9", category: "americas" },

  // Other
  { code: "ka", name: "Georgian", nativeName: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8", flag: "\uD83C\uDDEC\uD83C\uDDEA", category: "other" },
  { code: "hy", name: "Armenian", nativeName: "\u0540\u0561\u0575\u0565\u0580\u0565\u0576", flag: "\uD83C\uDDE6\uD83C\uDDF2", category: "other" },
  { code: "az", name: "Azerbaijani", nativeName: "Az\u0259rbaycan", flag: "\uD83C\uDDE6\uD83C\uDDFF", category: "other" },
  { code: "uz", name: "Uzbek", nativeName: "O\u02BBzbek", flag: "\uD83C\uDDFA\uD83C\uDDFF", category: "other" },
  { code: "kk", name: "Kazakh", nativeName: "\u049A\u0430\u0437\u0430\u049B", flag: "\uD83C\uDDF0\uD83C\uDDFF", category: "other" },
  { code: "ne", name: "Nepali", nativeName: "\u0928\u0947\u092A\u093E\u0932\u0940", flag: "\uD83C\uDDF3\uD83C\uDDF5", category: "other" },
  { code: "si", name: "Sinhala", nativeName: "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD", flag: "\uD83C\uDDF1\uD83C\uDDF0", category: "other" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  popular: "Popular",
  european: "European",
  asian: "Asian",
  "middle-eastern": "Middle Eastern",
  african: "African",
  americas: "Americas",
  other: "Other",
};

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

export function searchLanguages(query: string): Language[] {
  const q = query.toLowerCase().trim();
  if (!q) return LANGUAGES;
  return LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
  );
}
