"use client";

import { Button } from "@workspace/ui/components/button";
import { CircleUser, MoreHorizontalIcon, User, Wand2Icon } from "lucide-react";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import {
  ContactSession,
  ConversationStatus,
  createMessageDashboard,
  getManyDashboard,
  getOneDashboard,
  Message,
} from "@workspace/database";
import Image from "next/image";
import { cn } from "@workspace/ui/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const [conversation, setConversation] = useState<{
    id: string;
    agentId: string;
    contactSessionId: string;
    status: ConversationStatus;
    createdAt: Date;
    contactSession: ContactSession;
  }>();
  const [messages, setMessages] = useState<Message[]>();

  useEffect(() => {
    getOneDashboard(conversationId).then(setConversation);
  }, [conversationId]);

  useEffect(() => {
    getManyDashboard(conversationId, {}).then(setMessages);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessageDashboard(conversationId, values.message);
      form.reset();
      getManyDashboard(conversationId, {}).then(setMessages);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {(messages ?? []).map((message) => (
            <AIMessage
              from={message.role === "user" ? "assistant" : "user"}
              key={message.id}
            >
              <AIMessageContent className="group-[.is-user]:bg-gradient-to-tr! group-[.is-user]:from-secondary-foreground! group-[.is-user]:via-primary/5! group-[.is-user]:to-primary/5! group-[.is-user]:text-white!">
                <AIResponse>{message.content}</AIResponse>
              </AIMessageContent>
              {message.role === "user" && (
                <DicebearAvatar
                  seed={conversation?.contactSessionId!}
                  size={32}
                />
              )}
              {message.role === "humanAgent" && (
                <div className="flex items-center justify-center rounded-full p-1 bg-primary">
                  <User className="size-4 stroke-2 text-white" />
                </div>
              )}
              {message.role === "assistant" && (
                <Image
                  src={"/logo.svg"}
                  className="h-6 w-6 translate-y-[-6px]"
                  alt="logo"
                  width={4}
                  height={4}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
      </AIConversation>

      <div className="p-2">
        <Form {...form}>
          <AIInput onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={form.formState.isSubmitting}
                  onChange={(e) => {
                    let newValue = e.target.value;
                    if (
                      field.value === "" &&
                      newValue.length === 1 &&
                      /[a-z]/.test(newValue)
                    ) {
                      newValue = newValue.toUpperCase();
                    }
                    field.onChange(newValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder="Type your response as an operator..."
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton>
                  <Wand2Icon />
                  Enhance
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                  // TODO: OR if is enhancing prompt
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};
