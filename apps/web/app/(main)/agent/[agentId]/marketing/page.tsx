import { LeadsView } from "@/modules/marketing/ui/leads-view";
import { EmailTemplatesView } from "@/modules/marketing/ui/email-templates-view";
import React from "react";

const Page = () => {
  return (
    <div className="bg-muted p-6 pt-12 min-h-screen">
      <EmailTemplatesView />
      <LeadsView />
    </div>
  );
};

export default Page;
