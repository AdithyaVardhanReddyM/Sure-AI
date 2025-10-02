"use client";

import { WidgetHeader } from "../components/widget-header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { ArrowRightCircle } from "lucide-react";
import {
  ContactSessionMetadataInput,
  createContactSession,
} from "@workspace/database";
import { useAtomValue, useSetAtom } from "jotai";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  screenAtom,
} from "../../atoms/widget-atoms";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

// const agentId = "abcd-1234-efgh-5678"; // Example agentId, replace later

export const WidgetAuthScreen = () => {
  const setScreen = useSetAtom(screenAtom);

  const agentId = useAtomValue(agentIdAtom);
  const setContactSessionId = useSetAtom(
    contactSessionIdAtomFamily(agentId || "")
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!agentId) {
      return;
    }
    const metaData: ContactSessionMetadataInput = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(","),
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
      referrer: document.referrer || "direct",
      currentUrl: window.location.href,
    };
    const session = await createContactSession(
      values.name,
      values.email,
      agentId,
      metaData
    );
    if (session.contactSession?.id) {
      setContactSessionId(session.contactSession?.id);
      setScreen("selection");
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-2xl">Hi there! 👋🏻</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="bg-white/15 rounded-lg m-2">
        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-y-4 p-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-background">Name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 bg-white/20 border-none placeholder:text-white/50"
                      placeholder="e.g. Jack Smith"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-background">Email</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 bg-white/20 border-none placeholder:text-white/50"
                      placeholder="e.g. jack.smith@domain.com"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
              className="bg-white text-primary"
            >
              <span>Continue</span>
              <ArrowRightCircle className="h-5 w-5" />
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};
