import { ConversationIdView } from "@/modules/conversations/ui/conversations-Id-view";

const Page = async ({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) => {
  const { conversationId } = await params;
  return <ConversationIdView conversationId={conversationId} />;
};
export default Page;
