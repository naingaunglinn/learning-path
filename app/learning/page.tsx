import type { Metadata } from "next";
import { Suspense } from "react";
import { LearningView } from "@/components/learning/learning-view";

export const metadata: Metadata = { title: "Learning" };

export default function LearningPage() {
  return (
    <Suspense fallback={null}>
      <LearningView />
    </Suspense>
  );
}
