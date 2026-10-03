import Image from "next/image";
import SignatureMark from "./signature-mark";

/**
 * How a person is shown next to their name.
 *
 * Google sign-in gives us a real photo, which does more for recognising
 * someone at an event than anything generated. Everyone else keeps the
 * signature squiggle derived from their name.
 */
export default function PersonMark({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  if (!avatarUrl) {
    return <SignatureMark name={name} />;
  }

  return (
    <Image
      src={avatarUrl}
      alt=""
      width={26}
      height={26}
      className="person-avatar"
      aria-hidden="true"
    />
  );
}
