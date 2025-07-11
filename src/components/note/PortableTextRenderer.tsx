"use client";

import { PortableText } from "@portabletext/react";
import { myPortableTextComponents } from "./custom-components/PortableTextComponent";
import { Note } from "@/sanity/types";

interface PortableTextRendererProps {
  value: NonNullable<Note["content"]>;
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return <PortableText value={value} components={myPortableTextComponents} />;
}
