import { Link } from "next-view-transitions";
import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function WhatsappIcon() {
  return (
    <Link
      data-umami-event="nav-whatsapp-community-click"
      className="mt-1 hidden hover:cursor-pointer md:block"
      target="_blank"
      href="https://chat.whatsapp.com/EcretA1N7eCFQeHecm1uWO"
    >
      <Tooltip>
        <TooltipTrigger>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
            viewBox="0 0 22 22"
          >
            <g
              fill="none"
              stroke="#00a81c"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="m3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" />
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0za5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
            </g>
          </svg>
        </TooltipTrigger>
        <TooltipContent className="font-excon">
          <p>Join our community</p>
        </TooltipContent>
      </Tooltip>
    </Link>
  );
}
