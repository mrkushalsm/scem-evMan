"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { TestHeader } from "@/components/admin/test/header";
import { TestCard } from "@/components/admin/test/test-card";
import { EmptyState } from "@/components/admin/empty-placeholder";

export interface MongoTestContent {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  startsAt?: string;
  startTime?: string;
  endsAt?: string;
  endTime?: string;
  status?: string;
  problemCount?: number;
  questions?: unknown[];
  participants?: number;
  participantsInProgress?: number;
  participantsCompleted?: number;
  joinId?: string;
  createdAt?: string;
  duration?: string;
  durationMinutes?: number;
}

interface Props {
  initialTests: MongoTestContent[];
}

export function TestsList({ initialTests }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  // Map mongo objects to the shape TestCard expects.
  const tests = [...initialTests].reverse().map(t => {
    const totalMinutes = t.durationMinutes || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let durationStr = "";
    if (hours > 0) durationStr += `${hours}h `;
    if (minutes > 0) durationStr += `${minutes}m `;
    if (!durationStr) durationStr = "0m";

    return {
      id: (t.id || t._id || '') as string,
      title: t.title,
      description: t.description,
      status: (t.status || 'waiting') as "waiting" | "ongoing" | "completed",
      // Map other fields as necessary for TestCard
      questions: t.problemCount || t.questions?.length || 0,
      totalQuestions: t.problemCount || t.questions?.length || 0,
      problems: (t.questions || []) as string[],
      duration: t.duration || durationStr.trim(),
      startsAt: t.startsAt || t.startTime || '',
      endsAt: t.endsAt || t.endTime || '',
       participantsInProgress: t.participantsInProgress ?? t.participants ?? 0,
       participantsCompleted: t.participantsCompleted ?? 0,
       joinId: t.joinId || '',
      createdAt: t.createdAt || '',
    };
  });

  const filteredTests = tests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full w-full overflow-y-scroll">
      <div className="max-w-none w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <TestHeader />

        <div className="max-w-full sm:max-w-lg">
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-input border-border"
          />
        </div>

        {filteredTests.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <EmptyState
            searchTerm={searchTerm}
            title="No tests found"
            entityName="test"
            createUrl="/admin/tests/new/edit"
            createLabel="Create Your First Test"
          />
        )}
      </div>
    </div>
  );
}
