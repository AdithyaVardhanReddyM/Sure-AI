"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  updateAgentCalSettings,
  updateAgentSlackSettings,
  updateAgentStripeSettings,
  getAgentById,
} from "@workspace/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";

const Page = () => {
  const pathname = usePathname();
  const agentId = pathname.split("/")[2]; // Extract agent ID from URL

  const [calEnabled, setCalEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  // Modal states
  const [calModalOpen, setCalModalOpen] = useState(false);
  const [calUrl, setCalUrl] = useState("");
  const [slackModalOpen, setSlackModalOpen] = useState(false);
  const [slackBotToken, setSlackBotToken] = useState("");
  const [slackTeamId, setSlackTeamId] = useState("");
  const [slackChannelIds, setSlackChannelIds] = useState("");
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeApiKey, setStripeApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Cal.com form submission
  const handleCalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateAgentCalSettings(
        agentId!,
        calUrl.trim(),
        true
      );

      if (result.success) {
        setCalEnabled(true);
        setCalModalOpen(false);
        setCalUrl("");
      } else {
        console.error("Failed to update Cal.com settings:", result.error);
      }
    } catch (error) {
      console.error("Error updating Cal.com settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Slack form submission
  const handleSlackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slackBotToken.trim() || !slackTeamId.trim() || !slackChannelIds.trim())
      return;

    setIsSubmitting(true);
    try {
      const result = await updateAgentSlackSettings(
        agentId!,
        slackBotToken.trim(),
        slackTeamId.trim(),
        slackChannelIds.trim(),
        true
      );

      if (result.success) {
        setSlackEnabled(true);
        setSlackModalOpen(false);
        setSlackBotToken("");
        setSlackTeamId("");
        setSlackChannelIds("");
      } else {
        console.error("Failed to update Slack settings:", result.error);
      }
    } catch (error) {
      console.error("Error updating Slack settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Stripe form submission
  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeApiKey.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateAgentStripeSettings(
        agentId!,
        stripeApiKey.trim(),
        true
      );

      if (result.success) {
        setStripeEnabled(true);
        setStripeModalOpen(false);
        setStripeApiKey("");
      } else {
        console.error("Failed to update Stripe settings:", result.error);
      }
    } catch (error) {
      console.error("Error updating Stripe settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Slack toggle change
  const handleSlackToggle = async (checked: boolean) => {
    if (!agentId) return;

    if (checked) {
      setSlackModalOpen(true);
    } else {
      // Handle disable - clear all Slack fields
      try {
        const result = await updateAgentSlackSettings(
          agentId,
          "", // slackBotToken
          "", // slackTeamId
          "", // slackChannelIds
          false // slackEnabled
        );
        if (result.success) {
          setSlackEnabled(false);
          setSlackBotToken("");
          setSlackTeamId("");
          setSlackChannelIds("");
        } else {
          console.error("Failed to disable Slack:", result.error);
        }
      } catch (error) {
        console.error("Error disabling Slack:", error);
      }
    }
  };

  // Handle Stripe toggle change
  const handleStripeToggle = async (checked: boolean) => {
    if (!agentId) return;

    if (checked) {
      setStripeModalOpen(true);
    } else {
      // Handle disable - clear Stripe fields
      try {
        const result = await updateAgentStripeSettings(
          agentId,
          "", // stripeApiKey
          false // stripeEnabled
        );
        if (result.success) {
          setStripeEnabled(false);
          setStripeApiKey("");
        } else {
          console.error("Failed to disable Stripe:", result.error);
        }
      } catch (error) {
        console.error("Error disabling Stripe:", error);
      }
    }
  };

  // Load agent data on component mount
  useEffect(() => {
    const loadAgentData = async () => {
      if (!agentId) return;

      try {
        const result = await getAgentById(agentId);
        if (result.success && result.agent) {
          setCalEnabled(result.agent.CalEnabled || false);
          setSlackEnabled(result.agent.SlackEnabled || false);
          setStripeEnabled(result.agent.StripeEnabled || false);

          // Note: We're not loading the actual Slack values (SLACK_BOT_TOKEN, etc.)
          // for security reasons - they're sensitive data that shouldn't be sent to the frontend
        }
      } catch (error) {
        console.error("Error loading agent data:", error);
      }
    };

    loadAgentData();
  }, [agentId]);

  // Handle toggle change
  const handleCalToggle = async (checked: boolean) => {
    if (!agentId) return;

    if (checked) {
      setCalModalOpen(true);
    } else {
      // Handle disable - clear the fields
      try {
        const result = await updateAgentCalSettings(agentId, "", false);
        if (result.success) {
          setCalEnabled(false);
        } else {
          console.error("Failed to disable Cal.com:", result.error);
        }
      } catch (error) {
        console.error("Error disabling Cal.com:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 pt-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Actions</h1>
          <p className="text-lg text-gray-600">
            Configure integrations to enhance your agent's capabilities
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Image
                  src="/cal_logo.png"
                  alt="Cal.com logo"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Cal.com
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Scheduling Integration
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-6 text-gray-600 leading-relaxed">
                Seamlessly integrate Cal.com to enable your agent to schedule
                support calls and meetings effortlessly, enhancing customer
                interaction and reducing manual coordination.
              </CardDescription>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="cal-toggle"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable Integration
                </Label>
                <Switch
                  id="cal-toggle"
                  checked={calEnabled}
                  onCheckedChange={handleCalToggle}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Image
                  src="/slack_logo.png"
                  alt="Slack logo"
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Slack
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Notification Integration
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-6 text-gray-600 leading-relaxed">
                Notify your Slack channels instantly for critical cases,
                updates, or any other important events to keep your team
                informed.
              </CardDescription>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="slack-toggle"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable Notifications
                </Label>
                <Switch
                  id="slack-toggle"
                  checked={slackEnabled}
                  onCheckedChange={handleSlackToggle}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Image
                  src="/stripe_logo.png"
                  alt="Stripe logo"
                  width={58}
                  height={58}
                  className="rounded-full"
                />
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Stripe
                  </CardTitle>
                  <p className="text-sm text-gray-500">Payment Integration</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-6 text-gray-600 leading-relaxed">
                Empower your agent to handle payments securely through Stripe
                integration, managing transactions and subscriptions with ease.
              </CardDescription>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="stripe-toggle"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable Payments
                </Label>
                <Switch
                  id="stripe-toggle"
                  checked={stripeEnabled}
                  onCheckedChange={handleStripeToggle}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cal.com Configuration Modal */}
        <Dialog open={calModalOpen} onOpenChange={setCalModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Image
                  src="/cal_logo.png"
                  alt="Cal.com logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>Configure Cal.com Integration</span>
              </DialogTitle>
              <DialogDescription>
                Connect your Cal.com account to enable your agent to schedule
                meetings and calls.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCalSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cal-url">Cal.com Event Link</Label>
                <Input
                  id="cal-url"
                  type="url"
                  placeholder="https://cal.com/your-username/event-name"
                  value={calUrl}
                  onChange={(e) => setCalUrl(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter the shareable link from your Cal.com event
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  How to get your Cal.com link:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>
                    Go to{" "}
                    <a
                      href="https://cal.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      cal.com
                    </a>{" "}
                    and sign in
                  </li>
                  <li>
                    Navigate to{" "}
                    <a
                      href="https://app.cal.com/event-types"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      app.cal.com/event-types
                    </a>
                  </li>
                  <li>Create a new event type or select an existing one</li>
                  <li>Click on "Copy link to event"</li>
                  <li>Paste the link above</li>
                </ol>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCalModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !calUrl.trim()}>
                  {isSubmitting ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stripe Configuration Modal */}
        <Dialog open={stripeModalOpen} onOpenChange={setStripeModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Image
                  src="/stripe_logo.png"
                  alt="Stripe logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>Configure Stripe Integration</span>
              </DialogTitle>
              <DialogDescription>
                Connect your Stripe account to enable your agent to handle
                payments.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleStripeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-api-key">Secret Key</Label>
                <Input
                  id="stripe-api-key"
                  type="password"
                  placeholder="sk_test_..."
                  value={stripeApiKey}
                  onChange={(e) => setStripeApiKey(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Found in your Stripe Dashboard under API Keys
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  How to get your Stripe Secret Key:
                </h4>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>
                    Visit the{" "}
                    <a
                      href="https://dashboard.stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Stripe Dashboard
                    </a>
                  </li>
                  <li>Navigate to the "Home" page</li>
                  <li>Find the "API keys" section</li>
                  <li>
                    Copy the "Secret key" (starts with sk_test_... for testing)
                  </li>
                </ol>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStripeModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !stripeApiKey.trim()}
                >
                  {isSubmitting ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Slack Configuration Modal */}
        <Dialog open={slackModalOpen} onOpenChange={setSlackModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[70vh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Image
                  src="/slack_logo.png"
                  alt="Slack logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>Configure Slack Integration</span>
              </DialogTitle>
              <DialogDescription>
                Connect your Slack workspace to enable your agent to send
                notifications and interact with your team.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSlackSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slack-bot-token">Bot User OAuth Token</Label>
                <Input
                  id="slack-bot-token"
                  type="password"
                  placeholder="xoxb-your-bot-token-here"
                  value={slackBotToken}
                  onChange={(e) => setSlackBotToken(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Token that starts with "xoxb-"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slack-team-id">Team ID</Label>
                <Input
                  id="slack-team-id"
                  placeholder="T1234567890"
                  value={slackTeamId}
                  onChange={(e) => setSlackTeamId(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  The "T..." part from your Slack workspace URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slack-channel-ids">Channel IDs</Label>
                <Input
                  id="slack-channel-ids"
                  placeholder="C1234567890,C0987654321"
                  value={slackChannelIds}
                  onChange={(e) => setSlackChannelIds(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Comma-separated channel IDs (the "C..." parts from channel
                  URLs)
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">
                  How to set up Slack App:
                </h4>
                <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                  <li>
                    Visit the{" "}
                    <a
                      href="https://api.slack.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Slack Apps page
                    </a>
                  </li>
                  <li>Click "Create New App" → "From scratch"</li>
                  <li>Name your app and select your workspace</li>
                  <li>
                    Go to "OAuth & Permissions" and add these scopes:
                    <ul className="ml-6 mt-1 list-disc">
                      <li>channels:history</li>
                      <li>channels:read</li>
                      <li>chat:write</li>
                      <li>reactions:write</li>
                      <li>users:read</li>
                      <li>users.profile:read</li>
                    </ul>
                  </li>
                  <li>Click "Install to Workspace" and authorize</li>
                  <li>Copy the "Bot User OAuth Token" (starts with xoxb-)</li>
                  <li>
                    Open your Slack workspace:{" "}
                    <code className="bg-purple-100 px-1 rounded">
                      https://app.slack.com/client/T..../C....
                    </code>
                  </li>
                  <li>
                    Copy the Team ID (T....) and Channel ID (C....) from the URL
                  </li>
                  <li>
                    Add the bot to your channel using /invite @YourBotName
                  </li>
                </ol>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSlackModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !slackBotToken.trim() ||
                    !slackTeamId.trim() ||
                    !slackChannelIds.trim()
                  }
                >
                  {isSubmitting ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;
