import { z } from "zod";

export const ImageSchema = z.object({
  url: z.string(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export const ExternalUrlsSchema = z.object({
  spotify: z.string().optional(),
});

export const ExternalIdsSchema = z.object({
  isrc: z.string().optional(),
  ean: z.string().optional(),
  upc: z.string().optional(),
});

export const FollowersSchema = z.object({
  href: z.string().nullable(),
  total: z.number(),
});

export function PagingSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    href: z.string(),
    items: z.array(itemSchema),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
  });
}

export function CursorPagingSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    href: z.string(),
    items: z.array(itemSchema),
    limit: z.number(),
    next: z.string().nullable(),
    cursors: z.object({
      after: z.string().nullable().optional(),
      before: z.string().nullable().optional(),
    }),
    total: z.number().optional(),
  });
}

export type Image = z.infer<typeof ImageSchema>;
export type ExternalUrls = z.infer<typeof ExternalUrlsSchema>;
