import type { ContentBlock } from "@/types/blocks";
import { SplitDetailBlockView } from "./blocks/SplitDetailBlock";
import { FullMediaBlockView }   from "./blocks/FullMediaBlock";
import { HalfMediaTextBlockView } from "./blocks/HalfMediaTextBlock";

export function ProjectRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "split_detail":
            return <SplitDetailBlockView key={block.id} block={block} />;
          case "full_media":
            return <FullMediaBlockView key={block.id} block={block} />;
          case "half_media_text":
            return <HalfMediaTextBlockView key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
