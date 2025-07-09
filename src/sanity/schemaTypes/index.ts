import { type SchemaTypeDefinition } from "sanity";
import { note } from "@/sanity/schemaTypes/note";
import { customImageType } from "@/sanity/schemaTypes/image";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [note, customImageType],
};
