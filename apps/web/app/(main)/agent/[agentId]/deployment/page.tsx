"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Check, Copy, Settings } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { INTEGRATIONS } from "@/constants/integrations";

const Page = () => {
  const { agentId } = useParams();
  const [hasCopied, setHasCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(agentId as string);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const copyCodeToClipboard = async () => {
    const code = `<script data-agent-id="${agentId}"></script>`;
    await navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className=" p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Settings className="h-8 w-8 text-indigo-600 mr-2" />
              <CardTitle className="text-3xl font-bold text-gray-900">
                Setup and Integrations
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-gray-600">
              Choose the integration that's right for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <div className="text-sm font-medium text-gray-700">
                Your Agent ID
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm font-mono bg-gray-100 text-gray-800"
                >
                  {agentId}
                </Badge>
                <Button
                  size="sm"
                  variant={hasCopied ? "default" : "outline"}
                  className={`h-9 px-4 ${hasCopied ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600 border-green-200" : "hover:bg-indigo-50 hover:text-indigo-700 border-gray-300"}`}
                  onClick={copyToClipboard}
                  disabled={hasCopied}
                >
                  {hasCopied ? (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      <span className="text-sm">Copied!</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Copy className="h-4 w-4 mr-2" />
                      <span className="text-sm">Copy ID</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Integrations
            </CardTitle>
            <CardDescription className="text-gray-600">
              Add the following code to your website to enable the chatbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {INTEGRATIONS.map((integration) => (
                <Dialog key={integration.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 hover:border-indigo-300"
                    >
                      <Image
                        src={integration.icon}
                        alt={integration.title}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                      <span className="text-sm font-medium">
                        {integration.title}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Integrate with your website</DialogTitle>
                      <DialogDescription>
                        Follow these steps to add the chatbox to your website
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">
                          1. Copy the following code
                        </h3>
                        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                          {`<script data-agent-id="${agentId}"></script>`}
                        </div>
                        <Button
                          size="sm"
                          variant={codeCopied ? "default" : "outline"}
                          className={`mt-2 ${codeCopied ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600 border-green-200" : "hover:bg-indigo-50 hover:text-indigo-700 border-gray-300"}`}
                          onClick={copyCodeToClipboard}
                          disabled={codeCopied}
                        >
                          {codeCopied ? (
                            <div className="flex items-center">
                              <Check className="h-4 w-4 mr-2" />
                              <span className="text-sm">Copied!</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Copy className="h-4 w-4 mr-2" />
                              <span className="text-sm">Copy Code</span>
                            </div>
                          )}
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          2. Add the code in your page
                        </h3>
                        <p className="text-sm text-gray-600">
                          Paste the chatbox code above in your page. You can add
                          it in the HTML head section.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
