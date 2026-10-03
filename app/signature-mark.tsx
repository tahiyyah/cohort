import { getSignatureMark } from "@/lib/signature";

export default function SignatureMark({ name }: { name: string }) {
  const mark = getSignatureMark(name);
  const stroke = mark.ink === "stamp" ? "var(--stamp)" : "var(--ink)";

  return (
    <svg
      className="signature-mark"
      width="30"
      height="16"
      viewBox="0 0 32 16"
      fill="none"
      aria-hidden="true"
      style={{
        transform: `rotate(${mark.rotation}deg) scaleY(${mark.scaleY})`,
      }}
    >
      <path
        d={mark.path}
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
