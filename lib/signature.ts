function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const STROKE_TEMPLATES = [
  "M2 12 C 6 2, 10 2, 14 9 S 22 16, 26 6",
  "M2 8 C 5 2, 9 14, 13 8 C 16 3, 20 13, 24 8 L29 8",
  "M3 13 Q 8 1, 13 10 T 23 9 Q 27 6, 29 3",
];

export interface SignatureMarkSpec {
  path: string;
  rotation: number;
  scaleY: number;
  ink: "cream" | "stamp";
}

export function getSignatureMark(name: string): SignatureMarkSpec {
  const hash = hashString(name.trim().toLowerCase());
  const path = STROKE_TEMPLATES[hash % STROKE_TEMPLATES.length];
  const rotation = ((hash >> 3) % 17) - 8;
  const scaleY = 0.85 + ((hash >> 7) % 30) / 100;
  const ink = hash % 9 === 0 ? "stamp" : "cream";
  return { path, rotation, scaleY, ink };
}
