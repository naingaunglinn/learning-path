import type { Metadata } from "next";
import { WeekView } from "@/components/week/week-view";

export const metadata: Metadata = { title: "This Week" };

export default function WeekPage() {
  return <WeekView />;
}
