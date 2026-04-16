
import { ConversationIdView } from "@/modules/dasboard/ui/views/conversation-id-view";
import { Id } from "@workspace/backend/convex/_generated/dataModel";

const Page = async ({
    params,
}: {
    params: Promise<{ conversationId: string }>
}) => {
    const { conversationId } = await params;
    return (
        <ConversationIdView conversationId={conversationId as Id<"conversations">} />
    )
}

export default Page
