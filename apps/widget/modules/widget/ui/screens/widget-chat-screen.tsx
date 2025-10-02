"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon, SendIcon, User } from "lucide-react";
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

  // SSE listener for real-time message updates
  useEffect(() => {
    if (!conversationId) return;

    const eventSource = new EventSource("/api/events/messages");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "new_message" &&
          data.conversationId === conversationId
        ) {
          // Add the new message to the state
          setMessages((prevMessages) => {
            if (!prevMessages) return [data];
            // Check if message already exists to avoid duplicates
            const exists = prevMessages.some(
              (msg) => msg.id === data.messageId
            );
            if (exists) return prevMessages;
            return [
              ...prevMessages,
              {
                id: data.messageId,
                conversationId: data.conversationId,
                contactSessionId: data.contactSessionId,
                role: data.role,
                content: data.content,
                createdAt: new Date(data.createdAt),
              },
            ];
          });
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [conversationId]);

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
      <div className="flex flex-col h-full animate-in fade-in-50 duration-300">
        <div className="bg-gradient-to-b from-primary to-primary/90 shadow-md">
          <WidgetHeader className="flex items-center justify-between">
            <div className="flex items-center gap-x-2 sm:gap-x-3">
              <Button
                size="icon"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200"
                onClick={onBack}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <h2 className="text-base sm:text-lg font-semibold text-white">
                Chat
              </h2>
            </div>
            <Button
              size="icon"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </WidgetHeader>
        </div>
        <AIConversation className="bg-white/90 backdrop-blur-sm flex-1">
          <AIConversationContent className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            {(messages ?? [])?.map((message) => {
              return (
                <AIMessage
                  from={
                    message.role === "user"
                      ? "user"
                      : message.role === "humanAgent"
                        ? "assistant"
                        : "assistant"
                  }
                  key={message.id}
                  className="transition-all duration-200 ease-in-out hover:scale-[1.02]"
                >
                  <AIMessageContent className="shadow-sm border border-border/50 rounded-xl max-w-[85%] sm:max-w-[75%]">
                    <AIResponse className="prose prose-sm max-w-none dark:prose-invert">
                      {message.content}
                    </AIResponse>
                  </AIMessageContent>
                  {message.role === "assistant" && (
                    <div className="flex translate-y-[-4px] items-center justify-center rounded-full p-1.5 bg-white shadow-sm">
                      <Image
                        src={"/logo.svg"}
                        className="h-5 w-5"
                        alt="logo"
                        width={20}
                        height={20}
                      />
                    </div>
                  )}
                  {message.role === "humanAgent" && (
                    <div className="flex translate-y-[-4px] items-center justify-center rounded-full p-1.5 bg-primary shadow-sm">
                      <User className="size-4 stroke-2 text-white" />
                    </div>
                  )}
                  {/* <AIMessageAvatar src="/logo.svg" /> */}
                </AIMessage>
              );
            })}
            <AIConversationScrollButton />
          </AIConversationContent>
        </AIConversation>
        <div className="bg-white/80 backdrop-blur-sm p-2 sm:p-3 border-t border-border/50">
          <Form {...form}>
            <AIInput
              onSubmit={form.handleSubmit(onSubmit)}
              className="border border-primary/30 rounded-xl shadow-sm bg-background/80 backdrop-blur-sm"
            >
              <FormField
                control={form.control}
                // disabled={conversation?.status === "resolved"}
                name="message"
                render={({ field }) => (
                  <AIInputTextarea
                    // disabled={conversation?.status === "resolved"}
                    value={field.value}
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
                    placeholder="Type your message here..."
                    className="placeholder:text-muted-foreground/70 py-2 sm:py-3"
                  />
                )}
              />
              <AIInputToolbar className="p-1 sm:p-2">
                <AIInputTools />
                <AIInputSubmit
                  disabled={!form.formState.isValid}
                  status="ready"
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <SendIcon className="h-4 w-4" />
                </AIInputSubmit>
              </AIInputToolbar>
            </AIInput>
          </Form>
        </div>
      </div>
    </>
  );
};
