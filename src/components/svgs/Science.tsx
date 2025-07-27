import React from "react";
import Image from "next/image";

export default function Science({ className }: { className: string }) {
  return (
    <div>
      <Image
        width={50}
        height={50}
        className={`${className} block dark:hidden`}
        src="/doodles/science-l.svg"
        alt="Science"
      />
      <Image
        width={50}
        height={50}
        className={`${className} hidden dark:block`}
        src="/doodles/science-d.svg"
        alt="Science"
      />
    </div>
  );
}
