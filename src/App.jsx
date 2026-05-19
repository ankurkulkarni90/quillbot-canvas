import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const GFONTS = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@400;600;700&family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Outfit:wght@400;500;600;700&family=Bebas+Neue&display=swap";

/* ═══════════════ QUILLBOT DESIGN TOKENS ═══════════════ */
const QB = {
  green: "#499557", greenLight: "#E8F5E9", greenDark: "#2E7D32",
  bg: "#FFFFFF", surface: "#F5F7F9", surfaceHover: "#EEF1F5",
  border: "#E0E4EA", borderLight: "#F0F2F5",
  text: "#1B2432", textSecondary: "#5C6672", textTertiary: "#9AA3AE",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowLg: "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
  radius: 10, radiusSm: 6, radiusLg: 14,
  warn: "#F59E0B", warnBg: "#FFFBEB",
};

/* ═══════════════ COLOR SCHEMES ═══════════════ */
const SCHEMES = [
  { id: "quillbot", label: "QuillBot", dot: "#499557", bg: "#FFFFFF", text: "#1B2432", accent: "#499557", muted: "#5C6672", secondary: "#E8F5E9", accentText: "#FFFFFF" },
  { id: "midnight", label: "Midnight", dot: "#1E293B", bg: "#0F172A", text: "#F1F5F9", accent: "#38BDF8", muted: "#94A3B8", secondary: "#1E293B", accentText: "#0F172A" },
  { id: "coral", label: "Coral", dot: "#F43F5E", bg: "#FFFBFB", text: "#1F1F2E", accent: "#F43F5E", muted: "#6B7280", secondary: "#FFE4E6", accentText: "#FFFFFF" },
  { id: "ocean", label: "Ocean", dot: "#0EA5E9", bg: "#F0F9FF", text: "#0C2D48", accent: "#0369A1", muted: "#4B7C9E", secondary: "#E0F2FE", accentText: "#FFFFFF" },
  { id: "sand", label: "Sand", dot: "#D97706", bg: "#FEFDF8", text: "#3D2C1E", accent: "#B45309", muted: "#7C6B5A", secondary: "#FEF3C7", accentText: "#FFFFFF" },
  { id: "mono", label: "Mono", dot: "#18181B", bg: "#FAFAFA", text: "#09090B", accent: "#18181B", muted: "#71717A", secondary: "#F4F4F5", accentText: "#FAFAFA" },
];

/* ═══════════════ FONT PAIRINGS ═══════════════ */
const FONTS = [
  { id: "editorial", label: "Editorial", heading: "'Playfair Display', Georgia, serif", body: "'Source Sans 3', sans-serif", sample: "Ag" },
  { id: "modern", label: "Modern", heading: "'Sora', sans-serif", body: "'DM Mono', monospace", sample: "Ag" },
  { id: "warm", label: "Warm", heading: "'Fraunces', Georgia, serif", body: "'Outfit', sans-serif", sample: "Ag" },
  { id: "impact", label: "Impact", heading: "'Bebas Neue', Impact, sans-serif", body: "'Outfit', sans-serif", sample: "Ag" },
];

/* ═══════════════ TEMPLATES ═══════════════ */
const TEMPLATES = [
  { id: "social", label: "Social Post", ratio: "1 / 1", desc: "Instagram · LinkedIn", icon: "◻" },
  { id: "slide", label: "Presentation", ratio: "16 / 9", desc: "Slide deck", icon: "▭" },
  { id: "quote", label: "Quote Card", ratio: "4 / 5", desc: "Testimonial", icon: "❝" },
  { id: "banner", label: "Banner", ratio: "21 / 9", desc: "Cover · Header", icon: "▬" },
];

const DEFAULT = {
  headline: "Create at the speed of thought",
  subtitle: "From words to visuals in seconds",
  body: "Great creation tools don't give you a blank canvas. They give you a system where every choice feels intentional, every output feels designed, and every user feels like a creator.",
  cta: "Get Started",
  author: "— QuillBot",
};

/* ═══════════════ DETECTION REASONS (T1.4) ═══════════════ */
const DETECTION_REASONS = {
  "Quote": "Serif fonts and centered layouts make quotes feel intentional and quotable",
  "Bullet List": "Structured lists with clear visual hierarchy perform well on social feeds",
  "Presentation": "Slide format with accent typography gives your key points room to breathe",
  "Long-form": "Long content works best in slide format — key points get visual weight",
  "Short Text": "Short, punchy text works best in a wide banner — maximum impact, minimum clutter",
  "Announcement": "Square format with bold headline placement optimised for social sharing",
};

/* ═══════════════ VARIATION REASONS (T2.1) ═══════════════ */
const VARIATION_REASONS = [
  { schemes: [0], fonts: [0], keywords: /quote|said|wrote|believe/i, reason: "Editorial serif for quotable content" },
  { schemes: [1], fonts: [1], keywords: /tech|startup|launch|ship|build|code|api/i, reason: "Midnight + Modern for tech content" },
  { schemes: [2], fonts: [2], keywords: /creative|design|art|beautiful|brand/i, reason: "Coral warmth for creative energy" },
  { schemes: [4], fonts: [3], keywords: /announce|breaking|alert|urgent|launch|new/i, reason: "Impact display for announcements" },
  { schemes: [3], fonts: [0], keywords: /strategy|growth|insight|data|report/i, reason: "Ocean + Editorial for strategic content" },
  { schemes: [5], fonts: [1], keywords: /professional|corporate|business|enterprise/i, reason: "Mono for professional tone" },
];

/* ═══════════════ MOBILE HOOK (T1.1) ═══════════════ */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < breakpoint : false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ═══════════════ INSTRUCTION STRIPPER ═══════════════ */
const INTENT_PATTERNS = [
  /^(?:(?:create|make|write|draft|design|build|generate)\s+)?(?:me\s+)?(?:a|an)\s+(.+?)(?:\s+(?:with\s+(?:the\s+)?text|saying|that\s+says|with\s+content|reading|that\s+reads|about)\s*[:：]\s*)/i,
  /^(.+?)\s*[:：]\s*(?=\S)/i,
];

const TEMPLATE_HINTS = {
  social: /\b(?:x\s+post|tweet|social\s+post|instagram|linkedin\s+post|linkedin|insta|ig\s+post|fb\s+post|facebook)\b/i,
  slide: /\b(?:presentation|slide|deck|ppt|keynote)\b/i,
  quote: /\b(?:quote|testimonial|quote\s+card)\b/i,
  banner: /\b(?:banner|cover|header|hero)\b/i,
};

function stripInstruction(raw) {
  if (!raw || !raw.trim()) return { content: raw, templateHint: null };
  const text = raw.trim();

  for (const pattern of INTENT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const intentPart = match[1].trim().toLowerCase();
      const contentStart = match[0].length;
      const content = text.substring(contentStart).trim();

      if (content.length > 20) {
        let templateHint = null;
        for (const [tmpl, regex] of Object.entries(TEMPLATE_HINTS)) {
          if (regex.test(intentPart)) { templateHint = tmpl; break; }
        }
        return { content, templateHint };
      }
    }
  }

  return { content: text, templateHint: null };
}

/* ═══════════════ CONTENT TYPE DETECTION ═══════════════ */
const CONTENT_TYPES = {
  quote: { label: "Quote", template: "quote", confidence: 0, icon: "❝" },
  bullets: { label: "Bullet List", template: "social", confidence: 0, icon: "•" },
  presentation: { label: "Presentation", template: "slide", confidence: 0, icon: "▭" },
  announcement: { label: "Announcement", template: "social", confidence: 0, icon: "📢" },
  longform: { label: "Long-form", template: "slide", confidence: 0, icon: "¶" },
  short: { label: "Short Text", template: "banner", confidence: 0, icon: "▬" },
};

function detectContentType(raw) {
  if (!raw || !raw.trim()) return null;
  const text = raw.trim();
  const lines = text.split("\n").filter(l => l.trim());

  const hasAttribution = /[\u2014\u2013—–-]\s*[A-Z]/.test(text) || /^[""\u201C]/.test(text);
  const isShortPoetic = lines.length <= 4 && text.length < 200;
  if (hasAttribution && isShortPoetic) return { ...CONTENT_TYPES.quote, confidence: 90 };
  if (hasAttribution) return { ...CONTENT_TYPES.quote, confidence: 70 };

  const bulletLines = lines.filter(l => /^\s*[-•*▸▪→✓✅☑]\s/.test(l) || /^\s*\d+[.)]\s/.test(l));
  if (bulletLines.length >= 2 && bulletLines.length / lines.length > 0.4)
    return { ...CONTENT_TYPES.bullets, confidence: 85 };

  const headerLines = lines.filter(l => /^#{1,3}\s/.test(l) || (l.length < 40 && l === l.replace(/[a-z]/g, '') && l.length > 2));
  const sectionBreaks = raw.split(/\n\s*\n/).filter(s => s.trim()).length;
  if ((headerLines.length >= 2 || sectionBreaks >= 3) && lines.length >= 4)
    return { ...CONTENT_TYPES.presentation, confidence: 80 };

  if (text.length > 500) return { ...CONTENT_TYPES.longform, confidence: 75 };

  if (lines.length <= 2 && text.length < 100) return { ...CONTENT_TYPES.short, confidence: 70 };

  return { ...CONTENT_TYPES.announcement, confidence: 50 };
}

/* ═══════════════ SMART PASTE PARSER v2 ═══════════════ */
function safeTruncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str;
  let end = maxLen;
  const code = str.charCodeAt(end - 1);
  if (code >= 0xD800 && code <= 0xDBFF) end--;
  const lastSpace = str.lastIndexOf(" ", end);
  if (lastSpace > end * 0.7) end = lastSpace;
  return str.substring(0, end) + "…";
}

function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

function extractAttribution(lines) {
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(/^\s*[\u2014\u2013—–-]+\s*(.+)$/);
    if (match) {
      return { author: "— " + match[1].trim(), contentLines: lines.filter((_, idx) => idx !== i) };
    }
  }
  return { author: "", contentLines: lines };
}

function parseBullets(lines) {
  const result = [];
  for (const line of lines) {
    const cleaned = line.replace(/^\s*[-•*▸▪→✓✅☑]\s*/, "").replace(/^\s*\d+[.)]\s*/, "");
    if (cleaned.trim()) result.push(cleaned.trim());
  }
  return result;
}

function parseText(raw, contentType) {
  const cleaned = stripMarkdown(raw);
  const lines = cleaned.split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  const { author, contentLines } = extractAttribution(lines);

  if (contentType?.label === "Quote" || (author && contentLines.length <= 4)) {
    return {
      headline: contentLines[0] || "",
      subtitle: "",
      body: contentLines.slice(1).join(" "),
      cta: "",
      author: author,
    };
  }

  const bulletLines = contentLines.filter(l => /^\s*[-•*▸▪→✓✅☑]\s/.test(l) || /^\s*\d+[.)]\s/.test(l));
  if (bulletLines.length >= 2) {
    const titleLines = contentLines.filter(l => !bulletLines.includes(l));
    const bullets = parseBullets(bulletLines);
    return {
      headline: titleLines[0] || bullets[0] || "",
      subtitle: titleLines[1] || "",
      body: safeTruncate(bullets.slice(titleLines[0] ? 0 : 1).map(b => "• " + b).join("  "), 280),
      cta: "Learn More",
      author: author,
    };
  }

  if (contentType?.label === "Presentation") {
    const sections = raw.split(/\n\s*\n/).filter(s => s.trim());
    if (sections.length >= 2) {
      const firstSection = stripMarkdown(sections[0]).split("\n").filter(Boolean);
      const rest = sections.slice(1).map(s => stripMarkdown(s).split("\n").filter(Boolean).join(" "));
      return {
        headline: firstSection[0] || "",
        subtitle: firstSection.slice(1).join(" ") || "",
        body: safeTruncate(rest.join(" · "), 280),
        cta: "KEY INSIGHT",
        author: author,
      };
    }
  }

  if (contentLines.length === 1) {
    const text = contentLines[0];
    const sentences = text.split(/(?<!\b(?:Mr|Mrs|Ms|Dr|Jr|Sr|vs|etc|e\.g|i\.e|Prof|Inc|Ltd|Corp))\.\s+|[!?]+\s+/)
      .map(s => s.trim()).filter(Boolean);
    return {
      headline: safeTruncate(sentences[0] || text, 80),
      subtitle: sentences[1] ? safeTruncate(sentences[1], 60) : "",
      body: safeTruncate(sentences.slice(2).join(". "), 280),
      cta: "Learn More",
      author: author,
    };
  }

  const headline = safeTruncate(contentLines[0], 80);
  const subtitle = contentLines.length > 2 ? safeTruncate(contentLines[1], 60) : "";
  const bodyLines = contentLines.length > 2 ? contentLines.slice(2) : contentLines.slice(1);
  return {
    headline,
    subtitle,
    body: safeTruncate(bodyLines.join(" "), 280),
    cta: "Learn More",
    author: author,
  };
}

/* ═══════════════ STYLE RECOMMENDATION ENGINE ═══════════════ */
function recommendStyle(contentType, content) {
  const suggestions = [];
  const text = (content.headline + " " + content.body).toLowerCase();

  if (contentType?.label === "Quote") {
    suggestions.push({ type: "font", value: 0, reason: "Editorial serif pairs beautifully with quotes" });
  } else if (/startup|launch|ship|build|fast|speed|growth/i.test(text)) {
    suggestions.push({ type: "font", value: 1, reason: "Modern sans for tech/startup content" });
  } else if (/luxury|premium|craft|artisan|elegant/i.test(text)) {
    suggestions.push({ type: "font", value: 2, reason: "Warm serif for premium positioning" });
  } else if (/announce|breaking|alert|urgent|bold/i.test(text)) {
    suggestions.push({ type: "font", value: 3, reason: "Impact display for announcements" });
  }

  if (/professional|corporate|business|enterprise/i.test(text)) {
    suggestions.push({ type: "scheme", value: 5, reason: "Mono scheme for professional tone" });
  } else if (/creative|design|art|beautiful/i.test(text)) {
    suggestions.push({ type: "scheme", value: 2, reason: "Coral for creative energy" });
  }

  return suggestions;
}

/* ═══════════════ TEMPLATE RENDERERS ═══════════════ */

const textClamp = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word",
});

const EmptyPlaceholder = ({ text, color }) => (
  <span style={{ opacity: 0.25, fontStyle: "italic", color }}>{text}</span>
);

function SocialTpl({ content, c, f }) {
  const hasContent = content.headline || content.body;
  return (
    <div style={{ width: "100%", aspectRatio: "1/1", background: c.bg, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10%", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: "-8%", right: "-8%", width: "50%", height: "50%", borderRadius: "50%", background: c.accent, opacity: 0.06 }} />
      <div style={{ position: "absolute", bottom: "8%", left: 0, width: "6px", height: "28%", background: c.accent, borderRadius: "0 4px 4px 0" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: f.heading, fontSize: 44, fontWeight: 900, color: c.text, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "4%", ...textClamp(3) }}>
          {content.headline || <EmptyPlaceholder text="Your headline here" color={c.muted} />}
        </div>
        {content.subtitle && <div style={{ fontFamily: f.body, fontSize: 22, fontWeight: 600, color: c.accent, lineHeight: 1.35, ...textClamp(2) }}>{content.subtitle}</div>}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: f.body, fontSize: 17, color: c.muted, lineHeight: 1.65, marginBottom: "6%", maxWidth: "92%", ...textClamp(4) }}>
          {content.body || (!hasContent && <EmptyPlaceholder text="Paste or type your content" color={c.muted} />)}
        </div>
        {content.cta && <div style={{ display: "inline-block", fontFamily: f.body, fontSize: 16, fontWeight: 700, color: c.accentText, background: c.accent, padding: "14px 28px", borderRadius: 10 }}>{content.cta}</div>}
      </div>
    </div>
  );
}

function SlideTpl({ content, c, f }) {
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", background: c.bg, display: "flex", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "6px", height: "100%", background: c.accent }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "70%", borderRadius: "50%", background: c.accent, opacity: 0.04 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "5% 7% 5% 5%", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: f.body, fontSize: 14, fontWeight: 700, color: c.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "3%", ...textClamp(1) }}>{content.cta || "KEY INSIGHT"}</div>
        <div style={{ fontFamily: f.heading, fontSize: 42, fontWeight: 700, color: c.text, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "3%", maxWidth: "80%", ...textClamp(3) }}>
          {content.headline || <EmptyPlaceholder text="Slide title" color={c.muted} />}
        </div>
        <div style={{ width: 52, height: 4, background: c.accent, borderRadius: 2, marginBottom: "3%" }} />
        <div style={{ fontFamily: f.body, fontSize: 19, color: c.muted, lineHeight: 1.7, maxWidth: "70%", ...textClamp(3) }}>{content.body}</div>
      </div>
      <div style={{ position: "absolute", bottom: "4%", right: "4%", fontFamily: f.body, fontSize: 13, color: c.muted, opacity: 0.4, ...textClamp(1) }}>{content.subtitle}</div>
    </div>
  );
}

function QuoteTpl({ content, c, f }) {
  const hasQuote = content.headline || content.body;
  return (
    <div style={{ width: "100%", aspectRatio: "4/5", background: c.bg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10%", position: "relative", overflow: "hidden", textAlign: "center", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px", background: `linear-gradient(90deg, transparent 10%, ${c.accent} 50%, transparent 90%)` }} />
      {hasQuote && <div style={{ position: "absolute", top: "4%", left: "50%", transform: "translateX(-50%)", fontFamily: f.heading, fontSize: 140, color: c.accent, opacity: 0.07, lineHeight: 1, userSelect: "none" }}>{"\u201C"}</div>}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "92%" }}>
        <div style={{ fontFamily: f.heading, fontSize: 34, fontWeight: 700, color: c.text, lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: "6%", fontStyle: "italic", ...textClamp(5) }}>
          {content.headline || <EmptyPlaceholder text="Your quote here" color={c.muted} />}
        </div>
        {content.body && <div style={{ fontFamily: f.body, fontSize: 17, color: c.muted, lineHeight: 1.65, marginBottom: "8%", ...textClamp(4) }}>{content.body}</div>}
        {(content.author || content.subtitle) && <>
          <div style={{ width: 40, height: 3, background: c.accent, margin: "0 auto 5%", borderRadius: 2 }} />
          <div style={{ fontFamily: f.body, fontSize: 16, fontWeight: 700, color: c.accent, letterSpacing: "0.06em", textTransform: "uppercase", ...textClamp(1) }}>{content.author || content.subtitle}</div>
        </>}
      </div>
    </div>
  );
}

function BannerTpl({ content, c, f }) {
  return (
    <div style={{ width: "100%", aspectRatio: "21/9", background: c.bg, display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      {[...Array(4)].map((_, i) => <div key={i} style={{ position: "absolute", right: `${8 + i * 7}%`, top: "50%", width: `${2 + i * 0.4}px`, height: `${25 + i * 15}%`, background: c.accent, opacity: 0.03 + i * 0.02, transform: "translateY(-50%) rotate(15deg)", borderRadius: 2 }} />)}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5px", background: c.accent }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 6%", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "65%" }}>
          <div style={{ fontFamily: f.heading, fontSize: 38, fontWeight: 700, color: c.text, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "2%", ...textClamp(2) }}>
            {content.headline || <EmptyPlaceholder text="Banner headline" color={c.muted} />}
          </div>
          <div style={{ fontFamily: f.body, fontSize: 18, color: c.muted, lineHeight: 1.5, ...textClamp(2) }}>{content.subtitle}</div>
        </div>
        {content.cta && <div style={{ fontFamily: f.body, fontSize: 16, fontWeight: 700, color: c.accentText, background: c.accent, padding: "14px 28px", borderRadius: 10, whiteSpace: "nowrap", flexShrink: 0 }}>{content.cta}</div>}
      </div>
    </div>
  );
}

/* ═══════════════ ICONS ═══════════════ */
const DownloadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const SparkleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/></svg>;
const LayoutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>;
const ShuffleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
const WandIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M11.2 6.2L10 5"/><path d="M6.87 18.49l-3.36-3.36a1 1 0 010-1.41l9.82-9.82a1 1 0 011.41 0l3.36 3.36a1 1 0 010 1.41l-9.82 9.82a1 1 0 01-1.41 0z"/></svg>;
const ChevronIcon = ({ dir = "left" }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "right" ? "rotate(180deg)" : "none" }}><polyline points="15 18 9 12 15 6"/></svg>;
const InfoIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const CopyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CloseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ═══════════════ EXAMPLES (T3.4) ═══════════════ */
const EXAMPLES = [
  {
    label: "LinkedIn thought leadership",
    text: "The best creation tools don't give you a blank canvas. They give you a system where every choice feels intentional, every output feels designed, and every user feels like a creator.\n\nThat's what we're building at QuillBot.\n\n— QuillBot Design Team"
  },
  {
    label: "Product launch quote",
    text: "\"We believe the future of creation isn't about making tools more powerful — it's about making powerful tools feel effortless.\"\n— QuillBot"
  },
  {
    label: "Feature announcement",
    text: "QuillBot Canvas — Now Available\n• Turn any text into a polished visual in seconds\n• AI-powered template routing and style suggestions\n• 96 style combinations, zero design skills required\n• Export for LinkedIn, Instagram, presentations, and email"
  },
  {
    label: "Presentation slide",
    text: "The Creation Gap\n\n68% of professionals create visual content weekly, but only 12% feel confident in their design skills.\n\nQuillBot Canvas bridges that gap — from draft to visual in seconds.\n\nKey insight: Structured templates with intelligent defaults outperform blank-canvas editors 3:1 for non-designers."
  },
];

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function App() {
  const isMobile = useIsMobile();
  const [screen, setScreen] = useState("create");
  const [createText, setCreateText] = useState("");
  const [createDetected, setCreateDetected] = useState(null);
  const [content, setContent] = useState({ ...DEFAULT });
  const [templateId, setTemplateId] = useState("social");
  const [schemeIdx, setSchemeIdx] = useState(0);
  const [fontIdx, setFontIdx] = useState(0);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detectedType, setDetectedType] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [variationCount, setVariationCount] = useState(0);
  const [exportNote, setExportNote] = useState("");
  // v3 states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mobileTab, setMobileTab] = useState("preview");
  const [showPrototypeBanner, setShowPrototypeBanner] = useState(true);
  const [variationReason, setVariationReason] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  const previewRef = useRef(null);
  const fontLinkRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GFONTS;
    document.head.appendChild(link);
    fontLinkRef.current = link;

    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
      @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);

    return () => {
      if (fontLinkRef.current && document.head.contains(fontLinkRef.current)) {
        document.head.removeChild(fontLinkRef.current);
      }
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const scheme = SCHEMES[schemeIdx];
  const font = FONTS[fontIdx];
  const update = (k, v) => setContent(p => ({ ...p, [k]: v }));

  // Content type detection on paste text change
  useEffect(() => {
    if (pasteText.trim()) {
      const detected = detectContentType(pasteText);
      setDetectedType(detected);
    } else {
      setDetectedType(null);
    }
  }, [pasteText]);

  // Screen 1: detection with analyzing delay (T1.4)
  useEffect(() => {
    if (createText.trim()) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const { content: stripped } = stripInstruction(createText);
        setCreateDetected(detectContentType(stripped));
        setIsAnalyzing(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setCreateDetected(null);
      setIsAnalyzing(false);
    }
  }, [createText]);

  // Screen 1 → Screen 2 transition
  const handleCreate = useCallback(() => {
    const { content: stripped, templateHint } = stripInstruction(createText);
    const detected = detectContentType(stripped);
    const parsed = parseText(stripped, detected);
    if (parsed) {
      setContent(prev => ({ ...prev, ...parsed }));
      const finalTemplate = templateHint || (detected ? detected.template : "social");
      setTemplateId(finalTemplate);
      if (detected) {
        const recs = recommendStyle(detected, parsed);
        if (recs.length > 0) {
          setSuggestions(recs);
          setShowSuggestions(true);
        }
      }
      setScreen("editor");
    }
  }, [createText]);

  // Go back to Screen 1
  const handleStartOver = useCallback(() => {
    setScreen("create");
    setCreateText("");
    setCreateDetected(null);
    setContent({ ...DEFAULT });
    setTemplateId("social");
    setSchemeIdx(0);
    setFontIdx(0);
    setVariationCount(0);
    setSuggestions([]);
    setShowSuggestions(false);
    setVariationReason("");
    setMobileTab("preview");
    setIsAnalyzing(false);
  }, []);

  const handleSmartPaste = useCallback(() => {
    const { content: stripped, templateHint } = stripInstruction(pasteText);
    const detected = detectContentType(stripped);
    const parsed = parseText(stripped, detected);
    if (parsed) {
      setContent(prev => ({ ...prev, ...parsed }));
      const finalTemplate = templateHint || (detected ? detected.template : templateId);
      setTemplateId(finalTemplate);
      if (detected) {
        const recs = recommendStyle(detected, parsed);
        if (recs.length > 0) {
          setSuggestions(recs);
          setShowSuggestions(true);
        }
      }
      setPasteMode(false);
      setPasteText("");
      setDetectedType(null);
    }
  }, [pasteText, templateId]);

  const applySuggestion = useCallback((suggestion) => {
    if (suggestion.type === "font") setFontIdx(suggestion.value);
    if (suggestion.type === "scheme") setSchemeIdx(suggestion.value);

    setSuggestions(prev => {
      const newSuggestions = prev.filter(s => s !== suggestion);
      if (newSuggestions.length <= 1) setShowSuggestions(false);
      return newSuggestions;
    });
  }, []);

  // Variation generator with reasoning (T2.1)
  const generateVariation = useCallback(() => {
    const nextVar = variationCount + 1;
    setVariationCount(nextVar);

    // Try content-aware match first
    const text = (content.headline + " " + content.body + " " + content.subtitle).toLowerCase();
    let matched = false;
    for (const vr of VARIATION_REASONS) {
      if (vr.keywords.test(text) && (vr.schemes[0] !== schemeIdx || vr.fonts[0] !== fontIdx)) {
        setSchemeIdx(vr.schemes[0]);
        setFontIdx(vr.fonts[0]);
        setVariationReason(vr.reason);
        matched = true;
        break;
      }
    }

    if (!matched) {
      const combos = [
        { scheme: 0, font: 0, reason: "Classic QuillBot green with editorial serif" },
        { scheme: 1, font: 1, reason: "Midnight dark mode with modern type" },
        { scheme: 2, font: 2, reason: "Coral energy with warm serif" },
        { scheme: 4, font: 3, reason: "Sand warmth with impact display" },
        { scheme: 3, font: 0, reason: "Ocean depth with editorial contrast" },
        { scheme: 5, font: 1, reason: "Minimal mono with modern precision" },
        { scheme: 1, font: 2, reason: "Dark sophistication with warm serif" },
        { scheme: 2, font: 3, reason: "Bold coral with impact headlines" },
        { scheme: 0, font: 1, reason: "QuillBot green with modern clarity" },
        { scheme: 4, font: 0, reason: "Warm sand tones with editorial grace" },
        { scheme: 3, font: 3, reason: "Ocean impact for bold statements" },
        { scheme: 5, font: 2, reason: "Mono warmth with refined serif" },
      ];
      const combo = combos[nextVar % combos.length];
      setSchemeIdx(combo.scheme);
      setFontIdx(combo.font);
      setVariationReason(combo.reason);
    }

    // Cycle template every 3 variations
    if (nextVar % 3 === 0) {
      const templateOrder = ["social", "slide", "quote", "banner"];
      const currentIdx = templateOrder.indexOf(templateId);
      setTemplateId(templateOrder[(currentIdx + 1) % templateOrder.length]);
    }

    // Auto-dismiss reason after 4 seconds
    setTimeout(() => setVariationReason(""), 4000);
  }, [variationCount, templateId, content, schemeIdx, fontIdx]);

  // Export with improved messages (T3.3)
  const handleDownload = useCallback(async () => {
    const el = previewRef.current;
    if (!el) return;
    setDownloading(true);
    setExportNote("");
    setExportSuccess(false);
    try {
      const rect = el.getBoundingClientRect();
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      const escapeForXml = (str) => str.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g, '&amp;');
      const html = escapeForXml(el.outerHTML);
      const fontUrl = GFONTS.replace(/&/g, '&amp;');
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <style>@import url('${fontUrl}');</style>
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:${rect.width}px;height:${rect.height}px">${html}</div>
        </foreignObject>
      </svg>`;

      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          try {
            const a = document.createElement("a");
            a.download = `quillbot-canvas-${templateId}-${scheme.id}-v${variationCount}.png`;
            a.href = canvas.toDataURL("image/png");
            a.click();
            setExportNote("Exported! Your visual is ready to share.");
            setExportSuccess(true);
          } catch {
            const a = document.createElement("a");
            a.download = `quillbot-canvas-${templateId}-${scheme.id}.svg`;
            a.href = URL.createObjectURL(new Blob([svgStr], { type: "image/svg+xml" }));
            a.click();
            setExportNote("Exported as SVG — full fidelity preserved.");
            setExportSuccess(true);
          }
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          const a = document.createElement("a");
          a.download = `quillbot-canvas-${templateId}-${scheme.id}.svg`;
          a.href = URL.createObjectURL(new Blob([svgStr], { type: "image/svg+xml" }));
          a.click();
          setExportNote("Exported as SVG — open in any browser to view.");
          setExportSuccess(true);
          resolve();
        };
        img.src = url;
      });
    } catch (e) {
      console.error("Export error:", e);
      setExportNote("Export didn't work in this browser. Try Chrome or Edge.");
      setExportSuccess(false);
    } finally {
      setDownloading(false);
      setTimeout(() => { setExportNote(""); setExportSuccess(false); }, 5000);
    }
  }, [templateId, scheme.id, variationCount]);

  // Copy to clipboard (T2.2)
  const canCopy = typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined";

  const handleCopy = useCallback(async () => {
    const el = previewRef.current;
    if (!el) return;
    setCopyStatus("copying");
    try {
      const rect = el.getBoundingClientRect();
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      const escapeForXml = (str) => str.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g, '&amp;');
      const html = escapeForXml(el.outerHTML);
      const fontUrl = GFONTS.replace(/&/g, '&amp;');
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <style>@import url('${fontUrl}');</style>
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:${rect.width}px;height:${rect.height}px">${html}</div>
        </foreignObject>
      </svg>`;

      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          canvas.toBlob(async (pngBlob) => {
            if (pngBlob) {
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({ "image/png": pngBlob })
                ]);
                setCopyStatus("copied");
              } catch {
                setCopyStatus("failed");
              }
            } else {
              setCopyStatus("failed");
            }
            resolve();
          }, "image/png");
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          setCopyStatus("failed");
          resolve();
        };
        img.src = url;
      });
    } catch {
      setCopyStatus("failed");
    }
    setTimeout(() => setCopyStatus(""), 2000);
  }, []);

  const renderPreview = () => {
    const p = { content, c: scheme, f: font };
    switch (templateId) {
      case "social": return <SocialTpl {...p} />;
      case "slide": return <SlideTpl {...p} />;
      case "quote": return <QuoteTpl {...p} />;
      case "banner": return <BannerTpl {...p} />;
      default: return <SocialTpl {...p} />;
    }
  };

  const ff = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";
  const inputBase = { width: "100%", background: QB.surface, border: `1px solid ${QB.border}`, borderRadius: QB.radiusSm, padding: "10px 14px", color: QB.text, fontFamily: ff, fontSize: isMobile ? 13 : 14, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", resize: "none", boxSizing: "border-box" };
  const focusIn = e => { e.target.style.borderColor = QB.green; e.target.style.boxShadow = `0 0 0 3px ${QB.greenLight}`; };
  const focusOut = e => { e.target.style.borderColor = QB.border; e.target.style.boxShadow = "none"; };
  const sectionLabelPrimary = { fontSize: isMobile ? 11 : 12, fontWeight: 700, color: QB.textSecondary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };
  const sectionLabelSecondary = { fontSize: isMobile ? 10 : 11, fontWeight: 700, color: QB.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 };

  const charCount = useMemo(() => {
    return (content.headline?.length || 0) + (content.subtitle?.length || 0) + (content.body?.length || 0);
  }, [content]);

  // Prototype banner component
  const PrototypeBanner = ({ onDismiss, compact = false }) => (
    <div style={{
      background: QB.surface, borderLeft: `4px solid ${QB.green}`,
      borderRadius: QB.radiusSm, padding: compact ? "10px 14px" : "14px 18px",
      marginBottom: compact ? 0 : 20, position: "relative",
      fontSize: compact ? 12 : 13, lineHeight: 1.55, color: QB.textSecondary,
    }}>
      <div style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: QB.green, marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Product Prototype
      </div>
      <div>
        This demonstrates the creation workflow for QuillBot's visual creation suite. In production, the text input would be processed by QuillBot's AI to auto-generate layouts, suggest brand-aware styles, and produce export-ready visuals. This prototype shows the content detection, template routing, and style recommendation logic that sits between the AI layer and the visual output.
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          position: "absolute", top: 8, right: 8,
          background: "none", border: "none", cursor: "pointer",
          color: QB.textTertiary, padding: 4, lineHeight: 1,
        }}><CloseIcon /></button>
      )}
    </div>
  );

  // ═══════════════ SCREEN 1: CREATION INTENT ═══════════════
  if (screen === "create") {
    const suggestedFont = createDetected ? (
      createDetected.label === "Quote" ? FONTS[0] :
      createDetected.label === "Presentation" ? FONTS[1] :
      createDetected.label === "Bullet List" ? FONTS[1] :
      FONTS[0]
    ) : null;
    const suggestedScheme = createDetected ? (
      createDetected.label === "Quote" ? SCHEMES[4] :
      createDetected.label === "Presentation" ? SCHEMES[1] :
      SCHEMES[0]
    ) : null;

    return (
      <div style={{
        width: "100%", height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: ff, background: QB.bg, overflow: "auto",
        position: "relative",
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none",
          background: `
            repeating-linear-gradient(0deg, transparent, transparent 31px, ${QB.border}33 31px, ${QB.border}33 32px),
            repeating-linear-gradient(90deg, transparent, transparent 31px, ${QB.border}33 31px, ${QB.border}33 32px)
          `,
        }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 640, padding: isMobile ? "0 16px" : "0 24px" }}>

          {/* Logo + Branding */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 40 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: QB.green,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16, boxShadow: "0 4px 16px rgba(73,149,87,0.25)",
            }}>
              <LayoutIcon />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: QB.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>QuillBot Canvas</div>
            <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: QB.text, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>
              What do you want to create?
            </h1>
            <p style={{ fontSize: isMobile ? 14 : 16, color: QB.textSecondary, marginTop: 10, lineHeight: 1.5 }}>
              Paste or type any text. We'll detect the content type and turn it into a visual.
            </p>
          </div>

          {/* Prototype banner (T1.2) */}
          {showPrototypeBanner && (
            <PrototypeBanner onDismiss={() => setShowPrototypeBanner(false)} />
          )}

          {/* Ecosystem link (T1.3) */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={QB.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            <span style={{ fontSize: 12, color: QB.green, fontWeight: 600, cursor: "pointer" }}>Paste from QuillBot Writer →</span>
          </div>

          {/* Big text input */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <textarea
              rows={6}
              placeholder={"Paste from QuillBot Writer, or type any text — a LinkedIn post,\na quote, bullet points, presentation notes…\n\nQuillBot Canvas detects what you're writing and picks the right\ntemplate, typography, and color system automatically."}
              value={createText}
              onChange={e => setCreateText(e.target.value)}
              style={{
                width: "100%", background: QB.bg,
                border: `2px solid ${createText.trim() ? QB.green : QB.border}`,
                borderRadius: QB.radiusLg, padding: isMobile ? "16px 16px" : "20px 22px",
                color: QB.text, fontFamily: ff, fontSize: isMobile ? 15 : 16, lineHeight: 1.6,
                outline: "none", resize: "none", boxSizing: "border-box",
                transition: "border-color 0.25s, box-shadow 0.25s",
                boxShadow: createText.trim() ? `0 0 0 4px ${QB.greenLight}` : QB.shadow,
              }}
              autoFocus
            />
            {createText.trim() && (
              <div style={{
                position: "absolute", bottom: 12, right: 14,
                fontSize: 11, color: QB.textTertiary, fontWeight: 500,
              }}>{createText.length} chars</div>
            )}
          </div>

          {/* Analyzing indicator (T1.4) */}
          {isAnalyzing && createText.trim() && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
              padding: "10px 16px", background: QB.surface, borderRadius: QB.radiusSm,
              border: `1px solid ${QB.borderLight}`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: QB.green,
                animation: "pulse 1s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 13, color: QB.textSecondary }}>Analyzing your content…</span>
            </div>
          )}

          {/* Detection result (T1.4 — with reasoning) */}
          {!isAnalyzing && createDetected && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20,
              padding: "12px 18px", background: QB.greenLight, borderRadius: QB.radius,
              border: `1px solid ${QB.green}33`,
              animation: "fadeSlideIn 0.3s ease",
            }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{createDetected.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: QB.greenDark }}>
                  {createDetected.label} detected
                  <span style={{ fontWeight: 500, opacity: 0.7, marginLeft: 8 }}>→ {TEMPLATES.find(t => t.id === createDetected.template)?.label}</span>
                </div>
                <div style={{ fontSize: 12, color: QB.greenDark, opacity: 0.8, marginTop: 2 }}>
                  Suggested: {suggestedFont?.label} · {suggestedScheme?.label}
                </div>
                <div style={{ fontSize: 12, color: QB.greenDark, opacity: 0.6, marginTop: 3, fontStyle: "italic" }}>
                  {DETECTION_REASONS[createDetected.label] || ""}
                </div>
              </div>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                background: suggestedScheme?.dot || QB.green,
                border: `1.5px solid ${QB.greenDark}44`,
              }} />
            </div>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!createText.trim()}
            style={{
              width: "100%", padding: "16px 0", borderRadius: QB.radius,
              border: "none", fontSize: 16, fontWeight: 700, fontFamily: ff,
              cursor: createText.trim() ? "pointer" : "default",
              background: createText.trim() ? QB.green : QB.surfaceHover,
              color: createText.trim() ? "#fff" : QB.textTertiary,
              boxShadow: createText.trim() ? "0 4px 16px rgba(73,149,87,0.3)" : "none",
              transition: "all 0.25s", marginBottom: 28,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            <SparkleIcon /> Create Visual
          </button>

          {/* Example chips */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: QB.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Try an example
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setCreateText(ex.text)} style={{
                  padding: "8px 16px", borderRadius: 20,
                  border: `1px solid ${QB.border}`, background: QB.bg,
                  color: QB.textSecondary, fontFamily: ff, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.target.style.background = QB.greenLight; e.target.style.borderColor = QB.green; e.target.style.color = QB.greenDark; }}
                  onMouseLeave={e => { e.target.style.background = QB.bg; e.target.style.borderColor = QB.border; e.target.style.color = QB.textSecondary; }}
                >{ex.label}</button>
              ))}
            </div>
          </div>

          {/* Skip */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setScreen("editor")} style={{
              background: "none", border: "none", color: QB.textTertiary,
              fontFamily: ff, fontSize: 13, cursor: "pointer", textDecoration: "underline",
              textUnderlineOffset: 3,
            }}>
              Skip — open editor with defaults
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 20 }}>
            <div style={{ fontSize: 11, color: QB.textTertiary }}>
              Built with <span style={{ color: "#E25555" }}>❤️</span> by <span style={{ fontWeight: 700, color: QB.textSecondary }}>Ankur Kulkarni</span> + <span style={{ fontWeight: 700, color: QB.textSecondary }}>Claude "Gerrard"</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ SCREEN 2: EDITOR ═══════════════

  // Shared controls panel (used in both mobile and desktop)
  const ControlsPanel = ({ style: wrapStyle = {} }) => (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 16px" : "16px 20px", ...wrapStyle }}>

      {/* Smart Paste (T1.3 rebrand) */}
      <div style={{ marginBottom: 20 }}>
        {!pasteMode ? (
          <button onClick={() => setPasteMode(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: QB.greenLight, border: `1.5px dashed ${QB.green}`, borderRadius: QB.radius, padding: "12px 16px", cursor: "pointer", color: QB.green, fontFamily: ff, fontSize: 13, fontWeight: 600 }}>
            <SparkleIcon /> Paste from QuillBot Writer
          </button>
        ) : (
          <div style={{ background: QB.surface, border: `1px solid ${QB.border}`, borderRadius: QB.radius, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: QB.green, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}><SparkleIcon /> Paste your draft</div>
            <textarea
              rows={5}
              placeholder={"Paste your draft from QuillBot Writer, or any text…\n\nThe parser detects content type and auto-routes to the right template."}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              style={{ ...inputBase, fontSize: 13, marginBottom: 8 }}
              onFocus={focusIn} onBlur={focusOut} autoFocus
            />

            {detectedType && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
                padding: "8px 12px", background: QB.greenLight, borderRadius: QB.radiusSm,
                fontSize: 12, color: QB.greenDark,
              }}>
                <span style={{ fontSize: 16 }}>{detectedType.icon}</span>
                <span>
                  Detected: <strong>{detectedType.label}</strong>
                  <span style={{ opacity: 0.6, marginLeft: 6 }}>→ {TEMPLATES.find(t => t.id === detectedType.template)?.label}</span>
                </span>
                <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.5 }}>{detectedType.confidence}%</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSmartPaste} disabled={!pasteText.trim()} style={{ flex: 1, padding: "9px 0", borderRadius: QB.radiusSm, border: "none", background: pasteText.trim() ? QB.green : QB.surfaceHover, color: pasteText.trim() ? "#fff" : QB.textTertiary, fontFamily: ff, fontSize: 13, fontWeight: 600, cursor: pasteText.trim() ? "pointer" : "default" }}>Parse & Fill</button>
              <button onClick={() => { setPasteMode(false); setPasteText(""); setDetectedType(null); }} style={{ padding: "9px 14px", borderRadius: QB.radiusSm, border: `1px solid ${QB.border}`, background: QB.bg, color: QB.textSecondary, fontFamily: ff, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Style suggestions banner */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: QB.warnBg, border: `1px solid ${QB.warn}33`, borderRadius: QB.radiusSm }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: QB.warn, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <WandIcon /> Style Suggestions
          </div>
          {suggestions.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: i < suggestions.length - 1 ? 6 : 0 }}>
              <span style={{ fontSize: 12, color: QB.textSecondary }}>{s.reason}</span>
              <button onClick={() => applySuggestion(s)} style={{ fontSize: 11, fontWeight: 600, color: QB.green, background: "none", border: `1px solid ${QB.green}`, borderRadius: 4, padding: "3px 10px", cursor: "pointer", fontFamily: ff }}>Apply</button>
            </div>
          ))}
          <button onClick={() => setShowSuggestions(false)} style={{ marginTop: 6, fontSize: 11, color: QB.textTertiary, background: "none", border: "none", cursor: "pointer", fontFamily: ff }}>Dismiss</button>
        </div>
      )}

      {/* Content Fields — primary section (T3.1) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={sectionLabelPrimary}>Content</div>
          <div style={{ fontSize: 11, color: charCount > 350 ? QB.warn : QB.textTertiary }}>{charCount} chars</div>
        </div>
        {[
          { key: "headline", label: "Headline", rows: 2, max: 80 },
          { key: "subtitle", label: "Subtitle", rows: 1, max: 60 },
          { key: "body", label: "Body", rows: 3, max: 280 },
          { key: "cta", label: "CTA / Tag", rows: 1, max: 30 },
          ...(templateId === "quote" ? [{ key: "author", label: "Author", rows: 1, max: 40 }] : []),
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: QB.textSecondary }}>{f.label}</label>
              {content[f.key]?.length > f.max && (
                <span style={{ fontSize: 10, color: QB.warn, display: "flex", alignItems: "center", gap: 3 }}>
                  <InfoIcon /> {content[f.key].length}/{f.max}
                </span>
              )}
            </div>
            {f.rows > 1
              ? <textarea rows={f.rows} value={content[f.key] || ""} onChange={e => update(f.key, e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
              : <input type="text" value={content[f.key] || ""} onChange={e => update(f.key, e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
            }
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: QB.borderLight, margin: "0 0 16px" }} />

      {/* Template — secondary section (T3.1) */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionLabelSecondary}>Template</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplateId(t.id)} style={{ background: templateId === t.id ? QB.greenLight : QB.surface, border: templateId === t.id ? `1.5px solid ${QB.green}` : `1px solid ${QB.borderLight}`, borderRadius: QB.radiusSm, padding: "10px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: templateId === t.id ? QB.green : QB.text, marginBottom: 1 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: QB.textTertiary }}>{t.desc}</div>
            </button>
          ))}
        </div>
        {/* Variation button (T3.1 — collapsed into template section) */}
        <button onClick={generateVariation} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: QB.surface, border: `1px solid ${QB.borderLight}`, borderRadius: QB.radiusSm,
          padding: "9px 16px", cursor: "pointer", color: QB.textSecondary,
          fontFamily: ff, fontSize: 12, fontWeight: 600,
          transition: "all 0.15s", marginTop: 6,
        }}>
          <ShuffleIcon /> Try Variation
          {variationCount > 0 && <span style={{ fontSize: 11, opacity: 0.5, marginLeft: 4 }}>#{variationCount}</span>}
        </button>
        {variationReason && (
          <div style={{ fontSize: 11, color: QB.textTertiary, fontStyle: "italic", marginTop: 6, textAlign: "center", animation: "fadeIn 0.3s ease" }}>
            {variationReason}
          </div>
        )}
      </div>

      {/* Colors — secondary section */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionLabelSecondary}>Color Scheme</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SCHEMES.map((s, i) => (
            <button key={s.id} onClick={() => setSchemeIdx(i)} title={s.label} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", background: s.dot, outline: schemeIdx === i ? `2.5px solid ${QB.green}` : `2px solid ${QB.border}`, outlineOffset: schemeIdx === i ? 3 : 1, transition: "all 0.2s", boxShadow: QB.shadow }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: QB.textSecondary, marginTop: 6, fontWeight: 500 }}>{scheme.label}</div>
      </div>

      {/* Typography — secondary section */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionLabelSecondary}>Typography</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {FONTS.map((fp, i) => (
            <button key={fp.id} onClick={() => setFontIdx(i)} style={{ background: fontIdx === i ? QB.greenLight : QB.surface, border: fontIdx === i ? `1.5px solid ${QB.green}` : `1px solid ${QB.borderLight}`, borderRadius: QB.radiusSm, padding: "10px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ fontFamily: fp.heading, fontSize: 20, fontWeight: 700, color: fontIdx === i ? QB.green : QB.text, lineHeight: 1 }}>{fp.sample}</div>
              <div style={{ fontSize: 11, color: QB.textTertiary, marginTop: 3, fontFamily: ff }}>{fp.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => { setContent({ ...DEFAULT }); setTemplateId("social"); setSchemeIdx(0); setFontIdx(0); setVariationCount(0); setSuggestions([]); setShowSuggestions(false); setVariationReason(""); }}
        onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.borderColor = "#FECACA"; }}
        onMouseLeave={e => { e.currentTarget.style.background = QB.surface; e.currentTarget.style.color = QB.textTertiary; e.currentTarget.style.borderColor = QB.borderLight; }}
        style={{
          width: "100%", padding: "10px", borderRadius: QB.radiusSm,
          border: `1px solid ${QB.borderLight}`, background: QB.surface,
          color: QB.textTertiary, fontFamily: ff, fontSize: 12, fontWeight: 600,
          cursor: "pointer", marginBottom: 12, transition: "all 0.15s",
        }}
      >↺ Reset to defaults</button>
    </div>
  );

  // ═══════════════ MOBILE EDITOR LAYOUT (T1.1) ═══════════════
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", fontFamily: ff, background: QB.bg, overflow: "hidden" }}>

        {/* Mobile header */}
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${QB.border}`, background: QB.bg, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: QB.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: QB.text, letterSpacing: "-0.02em" }}>QuillBot Canvas</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setShowInfoModal(!showInfoModal)} title="About this prototype" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: QB.textTertiary, fontSize: 16 }}>ℹ️</button>
            <button onClick={handleStartOver} style={{
              background: "none", border: `1px solid ${QB.border}`, cursor: "pointer",
              padding: "4px 10px", color: QB.textSecondary, borderRadius: QB.radiusSm,
              fontFamily: ff, fontSize: 11, fontWeight: 600,
            }}>+ New</button>
          </div>
        </div>

        {/* Info modal */}
        {showInfoModal && (
          <div style={{ padding: "8px 16px", flexShrink: 0 }}>
            <PrototypeBanner onDismiss={() => setShowInfoModal(false)} compact />
          </div>
        )}

        {/* Mobile tab bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${QB.border}`, flexShrink: 0 }}>
          {["preview", "edit"].map(tab => (
            <button key={tab} onClick={() => setMobileTab(tab)} style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              borderBottom: mobileTab === tab ? `2px solid ${QB.green}` : "2px solid transparent",
              color: mobileTab === tab ? QB.green : QB.textTertiary,
              fontFamily: ff, fontSize: 13, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize",
            }}>{tab}</button>
          ))}
        </div>

        {/* Hidden preview for export — always in DOM so previewRef stays valid on edit tab */}
        {mobileTab !== "preview" && (
          <div style={{ position: "absolute", left: -9999, top: 0, opacity: 0, pointerEvents: "none" }}>
            <div ref={previewRef} style={{
              width: 400,
              aspectRatio: TEMPLATES.find(t => t.id === templateId)?.ratio,
              overflow: "hidden",
            }}>
              {renderPreview()}
            </div>
          </div>
        )}

        {/* Mobile content area */}
        {mobileTab === "preview" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Preview area */}
            <div style={{
              flex: 1, position: "relative", background: QB.surface,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16,
            }}>
              <div ref={previewRef} style={{
                ...(["slide", "banner"].includes(templateId)
                  ? { width: "100%", height: "auto" }
                  : { height: "100%", width: "auto", maxHeight: "100%" }
                ),
                aspectRatio: TEMPLATES.find(t => t.id === templateId)?.ratio,
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: QB.radiusLg, overflow: "hidden",
                boxShadow: QB.shadowLg, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
                {renderPreview()}
              </div>
            </div>

            {/* Compact toolbar info */}
            <div style={{ padding: "6px 16px", borderTop: `1px solid ${QB.border}`, background: QB.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 11, color: QB.textTertiary, flexShrink: 0, flexWrap: "wrap" }}>
              <span>{TEMPLATES.find(t => t.id === templateId)?.ratio.replace(" / ", ":")}</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span style={{ fontFamily: font.heading, fontWeight: 700 }}>Aa</span>
              <span>{font.label}</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: scheme.dot, display: "inline-block", border: `1px solid ${QB.border}` }} />
              <span>{scheme.label}</span>
              {variationCount > 0 && <span style={{ color: QB.green, fontWeight: 600 }}>#{variationCount}</span>}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Mini preview strip */}
            <div style={{
              height: 80, flexShrink: 0, background: QB.surface,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderBottom: `1px solid ${QB.border}`, padding: "8px 16px",
            }}>
              <div style={{
                height: "100%", width: "auto",
                aspectRatio: TEMPLATES.find(t => t.id === templateId)?.ratio,
                borderRadius: 6, overflow: "hidden",
                boxShadow: QB.shadow,
              }}>
                {renderPreview()}
              </div>
            </div>

            {/* Controls */}
            <ControlsPanel />
          </div>
        )}

        {/* Mobile sticky bottom bar with download (T2.2) */}
        <div style={{
          padding: "10px 16px", borderTop: `1px solid ${QB.border}`, background: QB.bg, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {exportNote && (
            <span style={{
              flex: 1, fontSize: 11,
              color: exportSuccess ? QB.greenDark : QB.textTertiary,
              background: exportSuccess ? QB.greenLight : "transparent",
              padding: exportSuccess ? "4px 8px" : 0,
              borderRadius: QB.radiusSm,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {exportSuccess && <CheckIcon />} {exportNote}
            </span>
          )}
          {!exportNote && <span style={{ flex: 1, fontSize: 11, color: QB.textTertiary }}>Ready for: LinkedIn · Instagram · Slides</span>}
          {canCopy && (
            <button onClick={handleCopy} disabled={copyStatus === "copying"} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
              background: QB.bg, color: copyStatus === "copied" ? QB.greenDark : QB.green,
              border: `1.5px solid ${copyStatus === "copied" ? QB.greenDark : QB.green}`,
              borderRadius: QB.radiusSm, fontFamily: ff, fontSize: 12, fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {copyStatus === "copied" ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          )}
          <button onClick={handleDownload} disabled={downloading} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: QB.green, color: "#fff", border: "none", borderRadius: QB.radiusSm,
            fontFamily: ff, fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: downloading ? 0.6 : 1, transition: "opacity 0.2s",
          }}>
            <DownloadIcon /> {downloading ? "…" : "Download"}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════ DESKTOP EDITOR LAYOUT ═══════════════

  // Ensure previewRef is always on the correct node in the preview tab on mobile.
  // On desktop, previewRef is always on the canvas preview below.

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", fontFamily: ff, background: QB.bg, overflow: "hidden" }}>

      {/* ─── SIDEBAR TOGGLE ─── */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{
          position: "fixed", top: 12, left: 12, zIndex: 100,
          width: 40, height: 40, borderRadius: QB.radius,
          background: QB.green, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: QB.shadowLg,
        }}>
          <ChevronIcon dir="right" />
        </button>
      )}

      {/* ─── SIDEBAR ─── */}
      <div style={{
        width: sidebarOpen ? 340 : 0,
        minWidth: sidebarOpen ? 340 : 0,
        height: "100%", background: QB.bg,
        borderRight: sidebarOpen ? `1px solid ${QB.border}` : "none",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.3s ease, min-width 0.3s ease",
      }}>

        {/* Header (T1.3 rebrand + T1.2 info icon) */}
        <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${QB.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: QB.radius, background: QB.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><LayoutIcon /></div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: QB.text, letterSpacing: "-0.03em" }}>QuillBot Canvas</div>
              <div style={{ fontSize: 11, color: QB.textTertiary }}>From Draft to Visual</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setShowInfoModal(!showInfoModal)} title="About this prototype" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: QB.textTertiary, fontSize: 16 }}>ℹ️</button>
            <button onClick={handleStartOver} title="New creation" style={{
              background: "none", border: `1px solid ${QB.border}`, cursor: "pointer",
              padding: "4px 10px", color: QB.textSecondary, borderRadius: QB.radiusSm,
              fontFamily: ff, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = QB.greenLight; e.currentTarget.style.borderColor = QB.green; e.currentTarget.style.color = QB.greenDark; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = QB.border; e.currentTarget.style.color = QB.textSecondary; }}
            >+ New</button>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: QB.textTertiary, borderRadius: 4 }}>
              <ChevronIcon dir="left" />
            </button>
          </div>
        </div>

        {/* Info modal (T1.2 Screen 2) */}
        {showInfoModal && (
          <div style={{ padding: "12px 20px 0" }}>
            <PrototypeBanner onDismiss={() => setShowInfoModal(false)} compact />
          </div>
        )}

        {/* Scrollable controls */}
        <ControlsPanel />

        {/* Footer (T3.2) */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${QB.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: QB.textTertiary }}>Built with <span style={{ color: "#E25555" }}>❤️</span> by <span style={{ fontWeight: 700, color: QB.textSecondary }}>Ankur Kulkarni</span> + <span style={{ fontWeight: 700, color: QB.textSecondary }}>Claude "Gerrard"</span></div>
          <div style={{ fontSize: 10, color: QB.textTertiary, padding: "2px 8px", border: `1px solid ${QB.borderLight}`, borderRadius: 4, fontWeight: 600, cursor: "default" }} title="QuillBot Canvas v3.0 — Product prototype by Ankur Kulkarni">v3.0</div>
        </div>
      </div>

      {/* ─── CANVAS AREA ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: QB.surface, overflow: "hidden" }}>

        {/* Toolbar (T2.2 — Copy button added) */}
        <div style={{ padding: "10px 24px", borderBottom: `1px solid ${QB.border}`, background: QB.bg, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: QB.textSecondary, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>
              {TEMPLATES.find(t => t.id === templateId)?.ratio.replace(" / ", ":")}
            </span>
            <div style={{ width: 1, height: 16, background: QB.border }} />
            <span style={{ fontSize: 12, color: QB.textSecondary, fontWeight: 500 }}><span style={{ fontFamily: font.heading, fontWeight: 700, marginRight: 4 }}>Aa</span>{font.label}</span>
            <div style={{ width: 1, height: 16, background: QB.border }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: scheme.dot, border: `1px solid ${QB.border}`, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: QB.textSecondary, fontWeight: 500 }}>{scheme.label}</span>
            </span>
            {variationCount > 0 && <>
              <div style={{ width: 1, height: 16, background: QB.border }} />
              <span style={{ fontSize: 12, color: QB.green, fontWeight: 600 }}>Variation #{variationCount}</span>
            </>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {exportNote && (
              <span style={{
                fontSize: 11, maxWidth: 240, textAlign: "right",
                color: exportSuccess ? QB.greenDark : QB.textTertiary,
                background: exportSuccess ? QB.greenLight : "transparent",
                padding: exportSuccess ? "4px 10px" : 0,
                borderRadius: QB.radiusSm,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {exportSuccess && <CheckIcon />} {exportNote}
              </span>
            )}
            {canCopy && (
              <button onClick={handleCopy} disabled={copyStatus === "copying"} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "8px 16px",
                background: QB.bg, color: copyStatus === "copied" ? QB.greenDark : QB.green,
                border: `1.5px solid ${copyStatus === "copied" ? QB.greenDark : QB.green}`,
                borderRadius: QB.radiusSm, fontFamily: ff, fontSize: 13, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {copyStatus === "copied" ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
              </button>
            )}
            <button onClick={handleDownload} disabled={downloading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: QB.green, color: "#fff", border: "none", borderRadius: QB.radiusSm, fontFamily: ff, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: downloading ? 0.6 : 1, transition: "opacity 0.2s" }}>
              <DownloadIcon /> {downloading ? "Exporting…" : "Download"}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1, position: "relative",
          background: `
            radial-gradient(circle at 50% 50%, rgba(73,149,87,0.03) 0%, transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 23px, ${QB.border}33 23px, ${QB.border}33 24px),
            repeating-linear-gradient(90deg, transparent, transparent 23px, ${QB.border}33 23px, ${QB.border}33 24px)
          `,
        }}>
          <div style={{
            position: "absolute", top: 24, bottom: 24, left: 24, right: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div ref={previewRef} style={{
              ...(["slide", "banner"].includes(templateId)
                ? { width: "94%", height: "auto" }
                : { height: "92%", width: "auto" }
              ),
              aspectRatio: TEMPLATES.find(t => t.id === templateId)?.ratio,
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: QB.radiusLg, overflow: "hidden",
              boxShadow: QB.shadowLg, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            }}>
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Bottom bar (T2.3) */}
        <div style={{ padding: "8px 24px", borderTop: `1px solid ${QB.border}`, background: QB.bg, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontSize: 11, color: QB.textTertiary, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, color: QB.textSecondary }}>96 style combinations</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>Zero design skills needed</span>
          </div>
          <div style={{ fontSize: 11, color: QB.textTertiary, display: "flex", alignItems: "center", gap: 6 }}>
            <span>Ready for: LinkedIn · Instagram · Slides · Email</span>
          </div>
        </div>
      </div>
    </div>
  );
}
