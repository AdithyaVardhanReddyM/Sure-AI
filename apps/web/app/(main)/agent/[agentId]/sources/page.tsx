"use client";
import SourcesClient from "@/components/sources-client";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathname = usePathname();
  const agentId = pathname.split("/")[2] || "";
  console.log(agentId);

  return (
    <div className="p-4 pt-8">
      <SourcesClient agentId={agentId} />
    </div>
  );
}
