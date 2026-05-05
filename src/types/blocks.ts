import { z } from "zod";

// ── Slider item ───────────────────────────────────────────────────────────────
export const SliderItemSchema = z.object({
  type:      z.enum(["image", "video"]),
  url:       z.string(),
  thumbnail: z.string().optional(),
  alt:       z.string().optional(),
});
export type SliderItem = z.infer<typeof SliderItemSchema>;

// ── Background ────────────────────────────────────────────────────────────────
export const BgSchema = z.enum(["dark", "light"]);
export type Bg = z.infer<typeof BgSchema>;

// ── Block: split_detail ───────────────────────────────────────────────────────
// layout "image_right":  left = small image + 2 caption cols | right = large image (50vw)
// layout "image_left":   reversed — large image left, small image + captions right
export const SplitDetailBlockSchema = z.object({
  id:          z.string(),
  type:        z.literal("split_detail"),
  bg:          BgSchema.default("dark"),
  layout:      z.enum(["image_right", "image_left"]).default("image_right"),
  small_image: z.string().optional(),
  big_image:   z.string().optional(),
  caption1:    z.string().optional(),
  caption2:    z.string().optional(),
});
export type SplitDetailBlock = z.infer<typeof SplitDetailBlockSchema>;

// ── Block: full_media ─────────────────────────────────────────────────────────
// Full-viewport image or auto-playing video
export const FullMediaBlockSchema = z.object({
  id:         z.string(),
  type:       z.literal("full_media"),
  bg:         BgSchema.default("dark"),
  media_type: z.enum(["image", "video"]).default("image"),
  url:        z.string().optional(),
  poster:     z.string().optional(),
  alt:        z.string().optional(),
  overlay:    z.boolean().default(false),
});
export type FullMediaBlock = z.infer<typeof FullMediaBlockSchema>;

// ── Block: half_media_text ────────────────────────────────────────────────────
// 50% media | 50% text column aligned to bottom edge
export const HalfMediaTextBlockSchema = z.object({
  id:         z.string(),
  type:       z.literal("half_media_text"),
  bg:         BgSchema.default("dark"),
  media_side: z.enum(["left", "right"]).default("left"),
  media_type: z.enum(["image", "video"]).default("image"),
  url:        z.string().optional(),
  poster:     z.string().optional(),
  alt:        z.string().optional(),
  heading:    z.string().optional(),
  body:       z.string().optional(),
});
export type HalfMediaTextBlock = z.infer<typeof HalfMediaTextBlockSchema>;

// ── Discriminated union ───────────────────────────────────────────────────────
export const ContentBlockSchema = z.discriminatedUnion("type", [
  SplitDetailBlockSchema,
  FullMediaBlockSchema,
  HalfMediaTextBlockSchema,
]);
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// ── Parse helper (safe, returns empty array on failure) ───────────────────────
export function parseContentBlocks(raw: unknown): ContentBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const result = ContentBlockSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

// ── Template catalogue ────────────────────────────────────────────────────────
// Distributed Omit so union members retain their specific fields
type BlockWithoutId =
  | Omit<SplitDetailBlock, "id">
  | Omit<FullMediaBlock, "id">
  | Omit<HalfMediaTextBlock, "id">;

export interface BlockTemplate {
  id:           string;
  label:        string;
  description:  string;
  icon:         string;
  defaultBlock: BlockWithoutId;
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id:          "split_dark_right",
    label:       "Split — Dark",
    description: "Small image + 2 captions · large image right",
    icon:        "◼",
    defaultBlock: { type: "split_detail", bg: "dark",  layout: "image_right", small_image: "", big_image: "", caption1: "", caption2: "" },
  },
  {
    id:          "split_light_right",
    label:       "Split — Light",
    description: "Small image + 2 captions · large image right",
    icon:        "◻",
    defaultBlock: { type: "split_detail", bg: "light", layout: "image_right", small_image: "", big_image: "", caption1: "", caption2: "" },
  },
  {
    id:          "split_dark_left",
    label:       "Split Reversed — Dark",
    description: "Large image left · small image + 2 captions right",
    icon:        "◼",
    defaultBlock: { type: "split_detail", bg: "dark",  layout: "image_left",  small_image: "", big_image: "", caption1: "", caption2: "" },
  },
  {
    id:          "split_light_left",
    label:       "Split Reversed — Light",
    description: "Large image left · small image + 2 captions right",
    icon:        "◻",
    defaultBlock: { type: "split_detail", bg: "light", layout: "image_left",  small_image: "", big_image: "", caption1: "", caption2: "" },
  },
  {
    id:          "full_image",
    label:       "Full Screen Image",
    description: "Full-viewport image",
    icon:        "⬛",
    defaultBlock: { type: "full_media", bg: "dark", media_type: "image", url: "", overlay: false },
  },
  {
    id:          "full_video",
    label:       "Full Screen Video",
    description: "Full-viewport auto-playing video",
    icon:        "▶",
    defaultBlock: { type: "full_media", bg: "dark", media_type: "video", url: "", poster: "", overlay: false },
  },
  {
    id:          "half_dark_left",
    label:       "Half Media + Text — Dark Left",
    description: "Image/video left · text column right (bottom aligned)",
    icon:        "◧",
    defaultBlock: { type: "half_media_text", bg: "dark",  media_side: "left",  media_type: "image", url: "", heading: "", body: "" },
  },
  {
    id:          "half_light_left",
    label:       "Half Media + Text — Light Left",
    description: "Image/video left · text column right (bottom aligned)",
    icon:        "◧",
    defaultBlock: { type: "half_media_text", bg: "light", media_side: "left",  media_type: "image", url: "", heading: "", body: "" },
  },
  {
    id:          "half_dark_right",
    label:       "Half Media + Text — Dark Right",
    description: "Image/video right · text column left (bottom aligned)",
    icon:        "◨",
    defaultBlock: { type: "half_media_text", bg: "dark",  media_side: "right", media_type: "image", url: "", heading: "", body: "" },
  },
  {
    id:          "half_light_right",
    label:       "Half Media + Text — Light Right",
    description: "Image/video right · text column left (bottom aligned)",
    icon:        "◨",
    defaultBlock: { type: "half_media_text", bg: "light", media_side: "right", media_type: "image", url: "", heading: "", body: "" },
  },
];
