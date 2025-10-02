"use client";

import { Uploader } from "@/components/Uploader";
import React from "react";

const Page = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Upload Sources</h1>
          <p className="text-muted-foreground">
            Upload PDF and TXT files to use as knowledge sources for your AI
            agents
          </p>
        </div>
        <Uploader />
      </div>
    </div>
  );
};

export default Page;
