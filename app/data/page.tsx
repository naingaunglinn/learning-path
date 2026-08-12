import type { Metadata } from "next";
import { DataView } from "@/components/data/data-view";

export const metadata: Metadata = { title: "Data" };

export default function DataPage() {
  return <DataView />;
}
