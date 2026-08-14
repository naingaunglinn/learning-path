import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseDetail } from "@/components/learning/course-detail";

export const metadata: Metadata = { title: "Course" };

export default function CourseDetailPage() {
  return (
    <Suspense fallback={null}>
      <CourseDetail />
    </Suspense>
  );
}
