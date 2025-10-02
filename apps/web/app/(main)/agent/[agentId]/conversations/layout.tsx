import { ConversationsLayout } from "@/modules/conversations/ui/conversations-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ConversationsLayout>{children}</ConversationsLayout>;
};
export default Layout;
