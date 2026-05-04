import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/HomeHero";

export const metadata: Metadata = {
  title: "Cloud Stone Studio — Crafting Atmosphere",
};

export default function HomePage() {
  return <HomeHero />;
}
