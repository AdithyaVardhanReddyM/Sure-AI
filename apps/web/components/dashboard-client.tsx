"use client";
import NoAgentCard from "@/components/no-agent-card";
import AgentDashboardCard from "@/components/agent-dashboard-card";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { createAgent } from "@/actions/agentActions";

interface Agent {
  id: string;
  name: string;
  clerkId: string;
}

interface DashboardClientProps {
  agents: Agent[];
}

export default function DashboardClient({ agents }: DashboardClientProps) {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [agentName, setAgentName] = useState("");

  const handleCreateAgent = async () => {
    if (!userId || !agentName.trim()) return;

    const result = await createAgent(userId, agentName.trim());
    if (result.success) {
      setIsOpen(false);
      setAgentName("");
      // Refresh the page to show the new agent
      window.location.reload();
    }
  };

  if (agents.length === 0) {
    return (
      <div className="relative flex flex-col gap-4 items-center justify-center min-h-svh">
        <NoAgentCard />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-1 h-4 w-4" />
              <span>Create Agent</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Start creating your new agent by giving it a name first.
                Additional configurations and settings will be available later.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="agentName" className="text-sm font-medium">
                  Agent Name
                </label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAgent}
                  disabled={!agentName.trim()}
                >
                  Create Agent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-1 h-4 w-4" />
              <span>Create Agent</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Start creating your new agent by giving it a name first.
                Additional configurations and settings will be available later.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="agentName" className="text-sm font-medium">
                  Agent Name
                </label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAgent}
                  disabled={!agentName.trim()}
                >
                  Create Agent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentDashboardCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
