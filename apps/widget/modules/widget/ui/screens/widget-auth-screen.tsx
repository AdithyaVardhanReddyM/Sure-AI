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
import { ArrowRightCircle, Loader2, Mail, User } from "lucide-react";
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
        <div className="px-3 py-6">
          <p className="text-sm font-semibold text-white">Welcome</p>
          <h1 className=" text-2xl font-semibold">Hi there! 👋🏻</h1>
          <p className="text-sm text-white/70">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="m-2 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur-md md:p-6">
        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-background/90">Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60"
                        aria-hidden="true"
                      />
                      <Input
                        className="h-11 pl-10 bg-white/20 border border-white/20 text-white placeholder:text-white/60 hover:bg-white/25 focus:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 transition-colors"
                        placeholder="e.g. Jack Smith"
                        type="text"
                        {...field}
                      />
                    </div>
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
                  <FormLabel className="text-background/90">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60"
                        aria-hidden="true"
                      />
                      <Input
                        className="h-11 pl-10 bg-white/20 border border-white/20 text-white placeholder:text-white/60 hover:bg-white/25 focus:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 transition-colors"
                        placeholder="e.g. jack.smith@domain.com"
                        type="text"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-200 to-white text-primary shadow-md transition-all hover:from-white hover:to-violet-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRightCircle className="size-5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
            <p className="px-1 text-xs text-white/70">
              We use your details solely to personalize your support experience.
            </p>
          </form>
        </Form>
      </div>
    </>
  );
};
