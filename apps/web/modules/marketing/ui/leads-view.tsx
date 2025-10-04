"use client";

import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { useEffect, useState } from "react";
import { getLeadsByAgentId } from "@workspace/database";
import { usePathname } from "next/navigation";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Mail, User } from "lucide-react";

export const LeadsView = () => {
  const pathname = usePathname();
  const agentId = pathname.split("/")[2];
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeadsByAgentId(agentId!)
      .then((data) => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [agentId]);

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Captured Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all leads captured for this agent
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 shadow-sm">
          <div className="text-sm font-medium">Total Leads</div>
          <div className="text-xl font-bold text-primary">{leads.length}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-background shadow-sm">
        <ScrollArea className="h-[60vh]">
          {loading ? (
            <SkeletonLeads />
          ) : leads.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Mail className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No leads yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Leads will appear here once visitors submit their contact
                  information
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-12 px-6 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="h-12 px-6 font-semibold">
                    Email
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead, index) => (
                  <TableRow
                    key={lead.id}
                    className={`hover:bg-muted/50 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-muted-foreground">
                          {lead.email}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

const SkeletonLeads = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="h-12 px-6 font-semibold">Name</TableHead>
          <TableHead className="h-12 px-6 font-semibold">Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 8 }).map((_, index) => (
          <TableRow
            key={index}
            className={`hover:bg-muted/50 transition-colors ${
              index % 2 === 0 ? "bg-background" : "bg-muted/20"
            }`}
          >
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
