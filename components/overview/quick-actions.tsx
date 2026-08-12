"use client";

import Link from "next/link";
import { CalendarCheck2, Download, GraduationCap, TextQuote } from "lucide-react";
import { toast } from "sonner";
import { downloadBackup } from "@/lib/export-file";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  function handleExport() {
    downloadBackup();
    toast.success("Backup downloaded", {
      description: "Full workspace as JSON — import it from the Data page anytime.",
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>The Monday moves</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        <Button asChild variant="outline" size="sm" className="justify-start">
          <Link href="/week">
            <CalendarCheck2 data-icon="inline-start" /> Plan this week
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="justify-start">
          <Link href="/learning">
            <GraduationCap data-icon="inline-start" /> Add a course
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="justify-start">
          <Link href="/bullets">
            <TextQuote data-icon="inline-start" /> Compose resume bullets
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={handleExport}>
          <Download data-icon="inline-start" /> Export JSON backup
        </Button>
      </CardContent>
    </Card>
  );
}
