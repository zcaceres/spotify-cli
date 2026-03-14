/**
 * Shared Zod schemas used across multiple Spotify API response types.
 *
 * @module
 */

import { z } from "zod";

/** Schema for a Spotify image object (album art, profile picture, etc.). */
export const ImageSchema = z.object({
  url: z.string(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

/** Schema for external URL links (e.g. Spotify web player URL). */
export const ExternalUrlsSchema = z.object({
  spotify: z.string().optional(),
});

/** Schema for external identifiers (ISRC, EAN, UPC). */
export const ExternalIdsSchema = z.object({
  isrc: z.string().optional(),
  ean: z.string().optional(),
  upc: z.string().optional(),
});

/** Schema for follower count information. */
export const FollowersSchema = z.object({
  href: z.string().nullable(),
  total: z.number(),
});

/**
 * Creates a Zod schema for Spotify's offset-based paginated responses.
 * @typeParam T - The Zod schema type for individual items in the page.
 * @param itemSchema - Schema used to validate each item in the `items` array.
 * @returns A Zod object schema representing a paginated response.
 */
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

/**
 * Creates a Zod schema for Spotify's cursor-based paginated responses.
 * @typeParam T - The Zod schema type for individual items in the page.
 * @param itemSchema - Schema used to validate each item in the `items` array.
 * @returns A Zod object schema representing a cursor-paginated response.
 */
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

/** A Spotify image (album art, profile picture, etc.). */
export type Image = z.infer<typeof ImageSchema>;

/** External URL links for a Spotify resource. */
export type ExternalUrls = z.infer<typeof ExternalUrlsSchema>;
