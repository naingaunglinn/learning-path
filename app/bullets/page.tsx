import type { Metadata } from "next";
import { BulletsView } from "@/components/bullets/bullets-view";

export const metadata: Metadata = { title: "Bullet Generator" };

export default function BulletsPage() {
  return <BulletsView />;
}
