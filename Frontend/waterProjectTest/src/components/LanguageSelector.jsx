import { useState, useRef, useEffect, useMemo } from "react";
import { theme } from "../theme";

const LANGUAGES = [
  { code: "af", en: "Afrikaans", native: "Afrikaans" }, { code: "sq", en: "Albanian", native: "Shqip" },
  { code: "am", en: "Amharic", native: "አማርኛ" }, { code: "ar", en: "Arabic", native: "العربية" },
  { code: "hy", en: "Armenian", native: "Հայերեն" }, { code: "as", en: "Assamese", native: "অসমীয়া" },
  { code: "ay", en: "Aymara", native: "Aymar aru" }, { code: "az", en: "Azerbaijani", native: "Azərbaycan" },
  { code: "bm", en: "Bambara", native: "Bamanankan" }, { code: "eu", en: "Basque", native: "Euskara" },
  { code: "be", en: "Belarusian", native: "Беларуская" }, { code: "bn", en: "Bengali", native: "বাংলা" },
  { code: "bho", en: "Bhojpuri", native: "भोजपुरी" }, { code: "bs", en: "Bosnian", native: "Bosanski" },
  { code: "bg", en: "Bulgarian", native: "Български" }, { code: "ca", en: "Catalan", native: "Català" },
  { code: "ceb", en: "Cebuano", native: "Cebuano" }, { code: "ny", en: "Chichewa", native: "Chichewa" },
  { code: "zh-CN", en: "Chinese (Simplified)", native: "中文简体" }, { code: "zh-TW", en: "Chinese (Traditional)", native: "中文繁體" },
  { code: "co", en: "Corsican", native: "Corsu" }, { code: "hr", en: "Croatian", native: "Hrvatski" },
  { code: "cs", en: "Czech", native: "Čeština" }, { code: "da", en: "Danish", native: "Dansk" },
  { code: "dv", en: "Dhivehi", native: "ދިވެހި" }, { code: "doi", en: "Dogri", native: "डोगरी" },
  { code: "nl", en: "Dutch", native: "Nederlands" }, { code: "en", en: "English", native: "English" },
  { code: "eo", en: "Esperanto", native: "Esperanto" }, { code: "et", en: "Estonian", native: "Eesti" },
  { code: "ee", en: "Ewe", native: "Eʋegbe" }, { code: "tl", en: "Filipino", native: "Filipino" },
  { code: "fi", en: "Finnish", native: "Suomi" }, { code: "fr", en: "French", native: "Français" },
  { code: "fy", en: "Frisian", native: "Frysk" }, { code: "gl", en: "Galician", native: "Galego" },
  { code: "ka", en: "Georgian", native: "ქართული" }, { code: "de", en: "German", native: "Deutsch" },
  { code: "el", en: "Greek", native: "Ελληνικά" }, { code: "gn", en: "Guarani", native: "Guarani" },
  { code: "gu", en: "Gujarati", native: "ગુજરાતી" }, { code: "ht", en: "Haitian Creole", native: "Kreyòl Ayisyen" },
  { code: "ha", en: "Hausa", native: "Hausa" }, { code: "haw", en: "Hawaiian", native: "ʻŌlelo Hawaiʻi" },
  { code: "iw", en: "Hebrew", native: "עברית" }, { code: "hi", en: "Hindi", native: "हिन्दी" },
  { code: "hmn", en: "Hmong", native: "Hmoob" }, { code: "hu", en: "Hungarian", native: "Magyar" },
  { code: "is", en: "Icelandic", native: "Íslenska" }, { code: "ig", en: "Igbo", native: "Asụsụ Igbo" },
  { code: "ilo", en: "Ilocano", native: "Ilokano" }, { code: "id", en: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ga", en: "Irish", native: "Gaeilge" }, { code: "it", en: "Italian", native: "Italiano" },
  { code: "ja", en: "Japanese", native: "日本語" }, { code: "jw", en: "Javanese", native: "Basa Jawa" },
  { code: "kn", en: "Kannada", native: "ಕನ್ನಡ" }, { code: "kk", en: "Kazakh", native: "Қазақ тілі" },
  { code: "km", en: "Khmer", native: "ខ្មែរ" }, { code: "rw", en: "Kinyarwanda", native: "Ikinyarwanda" },
  { code: "gom", en: "Konkani", native: "कोंकणी" }, { code: "ko", en: "Korean", native: "한국어" },
  { code: "kri", en: "Krio", native: "Krio" }, { code: "ku", en: "Kurdish", native: "Kurdî" },
  { code: "ckb", en: "Kurdish (Sorani)", native: "کوردی سۆرانی" }, { code: "ky", en: "Kyrgyz", native: "Кыргызча" },
  { code: "lo", en: "Lao", native: "ລາວ" }, { code: "la", en: "Latin", native: "Latina" },
  { code: "lv", en: "Latvian", native: "Latviešu" }, { code: "ln", en: "Lingala", native: "Lingála" },
  { code: "lt", en: "Lithuanian", native: "Lietuvių" }, { code: "lg", en: "Luganda", native: "Luganda" },
  { code: "lb", en: "Luxembourgish", native: "Lëtzebuergesch" }, { code: "mk", en: "Macedonian", native: "Македонски" },
  { code: "mai", en: "Maithili", native: "मैथिली" }, { code: "mg", en: "Malagasy", native: "Malagasy" },
  { code: "ms", en: "Malay", native: "Bahasa Melayu" }, { code: "ml", en: "Malayalam", native: "മലയാളം" },
  { code: "mt", en: "Maltese", native: "Malti" }, { code: "mi", en: "Maori", native: "Māori" },
  { code: "mr", en: "Marathi", native: "मराठी" }, { code: "mni-Mtei", en: "Meiteilon (Manipuri)", native: "মৈতৈলোন্" },
  { code: "lus", en: "Mizo", native: "Mizo ṭawng" }, { code: "mn", en: "Mongolian", native: "Монгол" },
  { code: "my", en: "Myanmar (Burmese)", native: "မြန်မာ" }, { code: "ne", en: "Nepali", native: "नेपाली" },
  { code: "no", en: "Norwegian", native: "Norsk" }, { code: "or", en: "Odia (Oriya)", native: "ଓଡ଼ିଆ" },
  { code: "om", en: "Oromo", native: "Afaan Oromoo" }, { code: "ps", en: "Pashto", native: "پښتو" },
  { code: "fa", en: "Persian", native: "فارسی" }, { code: "pl", en: "Polish", native: "Polski" },
  { code: "pt", en: "Portuguese", native: "Português" }, { code: "pa", en: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "qu", en: "Quechua", native: "Runa Simi" }, { code: "ro", en: "Romanian", native: "Română" },
  { code: "ru", en: "Russian", native: "Русский" }, { code: "sm", en: "Samoan", native: "Gagana Samoa" },
  { code: "sa", en: "Sanskrit", native: "संस्कृतम्" }, { code: "gd", en: "Scots Gaelic", native: "Gàidhlig" },
  { code: "nso", en: "Sepedi", native: "Sepedi" }, { code: "sr", en: "Serbian", native: "Српски" },
  { code: "st", en: "Sesotho", native: "Sesotho" }, { code: "sn", en: "Shona", native: "ChiShona" },
  { code: "sd", en: "Sindhi", native: "سنڌي" }, { code: "si", en: "Sinhala", native: "සිංහල" },
  { code: "sk", en: "Slovak", native: "Slovenčina" }, { code: "sl", en: "Slovenian", native: "Slovenščina" },
  { code: "so", en: "Somali", native: "Soomaali" }, { code: "es", en: "Spanish", native: "Español" },
  { code: "su", en: "Sundanese", native: "Basa Sunda" }, { code: "sw", en: "Swahili", native: "Kiswahili" },
  { code: "sv", en: "Swedish", native: "Svenska" }, { code: "tg", en: "Tajik", native: "Тоҷикӣ" },
  { code: "ta", en: "Tamil", native: "தமிழ்" }, { code: "tt", en: "Tatar", native: "Татар" },
  { code: "te", en: "Telugu", native: "తెలుగు" }, { code: "th", en: "Thai", native: "ไทย" },
  { code: "ti", en: "Tigrinya", native: "ትግርኛ" }, { code: "ts", en: "Tsonga", native: "Xitsonga" },
  { code: "tr", en: "Turkish", native: "Türkçe" }, { code: "tk", en: "Turkmen", native: "Türkmençe" },
  { code: "ak", en: "Twi", native: "Twi" }, { code: "uk", en: "Ukrainian", native: "Українська" },
  { code: "ur", en: "Urdu", native: "اردو" }, { code: "ug", en: "Uyghur", native: "ئۇيغۇرچە" },
  { code: "uz", en: "Uzbek", native: "Oʻzbekcha" }, { code: "vi", en: "Vietnamese", native: "Tiếng Việt" },
  { code: "cy", en: "Welsh", native: "Cymraeg" }, { code: "xh", en: "Xhosa", native: "isiXhosa" },
  { code: "yi", en: "Yiddish", native: "ייִדיש" }, { code: "yo", en: "Yoruba", native: "Yorùbá" },
  { code: "zu", en: "Zulu", native: "isiZulu" },
];

// Google's translate widget persists the chosen language in a cookie shaped
// like `/en/bn` (source/target). Every other page mounts a fresh instance of
// this component, so without reading that cookie back out, the label always
// falls back to "English" even though the page is already translated.
function getCookieLangCode() {
  const match = document.cookie.match(/googtrans=\/[^/]+\/([a-zA-Z-]+)/);
  return match ? match[1] : "en";
}

export default function LanguageSelector({ variant = "dark" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentCode, setCurrentCode] = useState(getCookieLangCode);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const current = LANGUAGES.find((l) => l.code === currentCode) || LANGUAGES.find((l) => l.code === "en");

  // Keep in sync if the cookie was set by another tab/instance after this
  // component already mounted (e.g. a race on first paint).
  useEffect(() => {
    const cookieCode = getCookieLangCode();
    if (cookieCode !== currentCode) setCurrentCode(cookieCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const q = search.trim().toLowerCase();
    return LANGUAGES.filter(
      (l) => l.en.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.native.includes(search.trim())
    );
  }, [search]);

  const triggerGoogleTranslate = (code, attempt = 0) => {
    const combo = document.querySelector(".goog-te-combo");
    if (!combo) {
      if (attempt < 60) {
        setTimeout(() => triggerGoogleTranslate(code, attempt + 1), 250);
      } else {
        console.error("Google Translate widget never initialized.");
      }
      return;
    }
    combo.value = code;
    combo.dispatchEvent(new Event("change"));
  };

  const handleSelect = (code) => {
    const domain = window.location.hostname;

    if (code === "en") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      setCurrentCode(code);
      setOpen(false);
      setSearch("");
      window.location.reload();
      return;
    }

    setCurrentCode(code);
    setOpen(false);
    setSearch("");
    triggerGoogleTranslate(code);
  };

  const isDark = variant === "dark";

  return (
    <div ref={dropdownRef} className="notranslate" translate="no" style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="notranslate"
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "8px 14px", borderRadius: 999,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.3)" : "var(--border-strong)"}`,
          background: isDark ? "rgba(255,255,255,0.12)" : "var(--surface)",
          color: isDark ? "#ffffff" : "var(--text)",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(var(--shadow-color),0.08)",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        <GlobeIcon color={isDark ? "#ffffff" : "var(--text)"} />
        {current.en}
        <ChevronIcon color={isDark ? "#ffffff" : "var(--text)"} open={open} />
      </button>

      {open && (
        <div className="notranslate anim-modal" translate="no" style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0, width: 300,
          background: theme.colors.surface, borderRadius: 14, boxShadow: "0 20px 48px rgba(var(--shadow-color),0.22)",
          overflow: "hidden", zIndex: 100, border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{ padding: 10, borderBottom: `1px solid ${theme.colors.border}` }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, opacity: 0.5 }}>🔎</span>
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                style={{
                  width: "100%", padding: "9px 10px 9px 30px", borderRadius: 9,
                  border: `1px solid ${theme.colors.borderStrong}`, fontSize: 13, outline: "none", boxSizing: "border-box",
                  background: theme.colors.bg, color: theme.colors.text,
                }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12.5, color: theme.colors.textFaint, textAlign: "center" }}>No languages found.</div>
            ) : (
              filtered.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    padding: "9px 16px", fontSize: 13.5, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: lang.code === current.code ? theme.colors.primaryLight : theme.colors.surface,
                    color: lang.code === current.code ? theme.colors.primary : theme.colors.text,
                    fontWeight: lang.code === current.code ? 700 : 500,
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => { if (lang.code !== current.code) e.currentTarget.style.background = "var(--surface-hover)"; }}
                  onMouseLeave={(e) => { if (lang.code !== current.code) e.currentTarget.style.background = "var(--surface)"; }}
                >
                  <span>{lang.en} <span style={{ opacity: 0.7 }}>({lang.native})</span></span>
                  {lang.code === current.code && <CheckIcon />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GlobeIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function ChevronIcon({ color, open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "transform 0.15s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}