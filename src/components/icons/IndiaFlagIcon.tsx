import { SVGProps } from "react";

export function IndiaFlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 16"
      {...props}
    >
      <defs>
        <clipPath id="in">
          <rect width="24" height="16" rx="2" ry="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#in)">
        {/* Saffron stripe */}
        <rect width="24" height="5.33" fill="#FF9933" />
        {/* White stripe */}
        <rect width="24" height="5.33" y="5.33" fill="#FFFFFF" />
        {/* Green stripe */}
        <rect width="24" height="5.34" y="10.66" fill="#138808" />
        {/* Chakra */}
        <circle
          cx="12"
          cy="8"
          r="1.5"
          fill="none"
          stroke="#000080"
          strokeWidth="0.2"
        />
        {/* Chakra spokes */}
        <g stroke="#000080" strokeWidth="0.1" fill="none">
          <line x1="12" y1="6.5" x2="12" y2="9.5" />
          <line x1="10.5" y1="8" x2="13.5" y2="8" />
          <line x1="10.94" y1="6.94" x2="13.06" y2="9.06" />
          <line x1="13.06" y1="6.94" x2="10.94" y2="9.06" />
        </g>
      </g>
    </svg>
  );
}
