import { NextResponse } from "next/server";

const categoryStyles: Record<string, { a: string; b: string; c: string; icon: string }> = {
  Mobiles: { a: "#0f766e", b: "#38bdf8", c: "#ecfeff", icon: "phone" },
  Electronics: { a: "#2563eb", b: "#a855f7", c: "#eff6ff", icon: "tech" },
  Fashion: { a: "#be123c", b: "#fb7185", c: "#fff1f2", icon: "bag" },
  Home: { a: "#b45309", b: "#f59e0b", c: "#fffbeb", icon: "home" },
  Beauty: { a: "#c026d3", b: "#f472b6", c: "#fdf4ff", icon: "spark" },
  Sports: { a: "#16a34a", b: "#84cc16", c: "#f0fdf4", icon: "sport" }
};

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function textLines(value: string, maxLength = 25) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const word of words) {
    const current = lines[lines.length - 1];
    if (!current || `${current} ${word}`.length > maxLength) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${current} ${word}`;
    }
  }

  return lines.slice(0, 2);
}

function iconSvg(type: string) {
  if (type === "phone") {
    return '<rect x="358" y="178" width="204" height="300" rx="32" fill="rgba(255,255,255,.9)"/><rect x="381" y="215" width="158" height="214" rx="18" fill="rgba(15,23,42,.12)"/><circle cx="460" cy="451" r="10" fill="rgba(15,23,42,.35)"/>';
  }

  if (type === "tech") {
    return '<rect x="268" y="210" width="384" height="230" rx="24" fill="rgba(255,255,255,.9)"/><rect x="302" y="244" width="316" height="154" rx="14" fill="rgba(15,23,42,.13)"/><rect x="234" y="456" width="452" height="22" rx="11" fill="rgba(255,255,255,.74)"/>';
  }

  if (type === "bag") {
    return '<path d="M316 272h288l-34 220H350l-34-220z" fill="rgba(255,255,255,.9)"/><path d="M392 274c0-58 136-58 136 0" fill="none" stroke="rgba(15,23,42,.35)" stroke-width="22" stroke-linecap="round"/>';
  }

  if (type === "home") {
    return '<path d="M244 338 460 178l216 160v154H284V338z" fill="rgba(255,255,255,.9)"/><rect x="400" y="370" width="120" height="122" rx="12" fill="rgba(15,23,42,.15)"/>';
  }

  if (type === "sport") {
    return '<circle cx="460" cy="334" r="134" fill="rgba(255,255,255,.9)"/><path d="M326 334h268M460 200c44 54 44 214 0 268M460 200c-44 54-44 214 0 268" fill="none" stroke="rgba(15,23,42,.22)" stroke-width="18"/>';
  }

  return '<path d="M460 180 500 292l118 10-90 76 28 116-96-62-96 62 28-116-90-76 118-10 40-112z" fill="rgba(255,255,255,.9)"/>';
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "Electronics";
  const name = searchParams.get("name") ?? "SealCart Product";
  const view = searchParams.get("view") ?? "detail";
  const tone = Number(searchParams.get("tone") ?? "0");
  const style = categoryStyles[category] ?? categoryStyles.Electronics;
  const rotate = (tone % 7) - 3;
  const safeName = escapeSvg(name);
  const safeCategory = escapeSvg(category);
  const safeView = escapeSvg(view.toUpperCase());
  const nameLines = textLines(name);
  const renderedName = nameLines
    .map((line, index) => `<tspan x="170" dy="${index === 0 ? 0 : 46}">${escapeSvg(line)}</tspan>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900" role="img" aria-label="${safeName}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${style.c}"/>
      <stop offset=".52" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${style.b}" stop-opacity=".5"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".45" r=".55">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
      <stop offset="1" stop-color="${style.a}" stop-opacity=".12"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#0f172a" flood-opacity=".18"/>
    </filter>
  </defs>
  <rect width="900" height="900" fill="url(#bg)"/>
  <circle cx="728" cy="168" r="120" fill="${style.a}" opacity=".12"/>
  <circle cx="150" cy="714" r="150" fill="${style.b}" opacity=".18"/>
  <rect x="122" y="118" width="656" height="656" rx="56" fill="url(#glow)" stroke="rgba(15,23,42,.08)"/>
  <g transform="rotate(${rotate} 460 340)" filter="url(#shadow)">
    ${iconSvg(style.icon)}
  </g>
  <circle cx="712" cy="656" r="58" fill="${style.a}"/>
  <text x="712" y="675" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="#ffffff">${escapeSvg(initials(name))}</text>
  <text x="170" y="650" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#0f172a">${safeCategory}</text>
  <text x="170" y="696" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="900" fill="#0f172a">${renderedName}</text>
  <text x="170" y="${nameLines.length > 1 ? 786 : 740}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="${style.a}">${safeView} VIEW</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
