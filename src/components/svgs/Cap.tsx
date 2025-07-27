import React from "react";
import Image from "next/image";

export default function Cap({ className }: { className: string }) {
  return (
    <div>
      <Image
        width={50}
        height={50}
        className={`${className} block dark:hidden`}
        src="/doodles/cap-l.svg"
        alt="cap"
      />
      <Image
        width={50}
        height={50}
        className={`${className} hidden dark:block`}
        src="/doodles/cap-d.svg"
        alt="cap"
      />
    </div>
  );
}
