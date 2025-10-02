"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import {
  getOne,
  ConversationStatus,
  getMany,
  createMessage,
} from "@workspace/database";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageAvatar,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import {
  AISuggestion,
  AISuggestions,
} from "@workspace/ui/components/ai/suggestion";
import { Message } from "@workspace/database";
import { Form, FormField } from "@workspace/ui/components/form";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import Image from "next/image";

const formSchema = z.object({
  message: z.string().min(1, "Message is Required"),
});

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const agentId = useAtomValue(agentIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(agentId || "")
  );

  const [conversation, setConversation] = useState<{
    _id: string;
    status: ConversationStatus;
  } | null>(null);

  const [messages, setMessages] = useState<Message[]>();

  useEffect(() => {
    if (conversationId && contactSessionId) {
      getOne(contactSessionId, conversationId).then((result) => {
        setConversation(result);
      });
    }
  }, [conversationId, contactSessionId]);

  useEffect(() => {
    if (conversationId && contactSessionId) {
      getMany(conversationId, contactSessionId, {}).then((result) => {
        setMessages(result);
      });
    }
  }, [conversationId, contactSessionId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !conversationId) {
      return;
    }

    await createMessage(contactSessionId, conversationId, values.message);

    form.reset();

    // Refetch messages after creating a new one
    if (conversationId && contactSessionId) {
      getMany(conversationId, contactSessionId, {}).then((result) => {
        setMessages(result);
      });
    }
  };

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  return (
    <>
      <div className="bg-gradient-to-b from-secondary-foreground to-primary">
        <WidgetHeader className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Button
              size="icon"
              className="bg-white/10 hover:bg-white/20"
              onClick={onBack}
            >
              <ArrowLeftIcon />
            </Button>
            <p>Chat</p>
          </div>
          <Button size="icon" className="bg-white/10 hover:bg-white/20">
            <MenuIcon />
          </Button>
        </WidgetHeader>
      </div>

      <AIConversation className="bg-white">
        <AIConversationContent>
          {(messages ?? [])?.map((message) => {
            return (
              <AIMessage
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>{message.content}</AIResponse>
                </AIMessageContent>
                {message.role === "assistant" && (
                  <Image
                    src={"/logo.svg"}
                    className="h-6 w-6 translate-y-[-6px]"
                    alt="logo"
                    width={4}
                    height={4}
                  />
                )}
                {/* <AIMessageAvatar src="/logo.svg" /> */}
              </AIMessage>
            );
          })}
        </AIConversationContent>
      </AIConversation>
      <div className="bg-white p-2">
        <Form {...form}>
          <AIInput
            onSubmit={form.handleSubmit(onSubmit)}
            className="border-2 border-primary/30"
          >
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={conversation?.status === "resolved"}
                  value={field.value}
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your message..."
                  }
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools />
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" || !form.formState.isValid
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </>
  );
};
