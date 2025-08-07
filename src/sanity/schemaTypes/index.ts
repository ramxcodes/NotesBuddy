import { type SchemaTypeDefinition } from "sanity";
import { note } from "@/sanity/schemaTypes/note";
import { customImageType } from "@/sanity/schemaTypes/image";
import { codeType } from "@/sanity/schemaTypes/code";
import { youtubeType } from "@/sanity/schemaTypes/youtube";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [note, customImageType, codeType, youtubeType],
};
