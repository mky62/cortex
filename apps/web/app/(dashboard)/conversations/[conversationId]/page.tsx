
const Page = async ({
    params,
}: {
    params: Promise<{ conversationId: string }>
}) => {
    const { conversationId } = await params;
    return (
        <div>
            <h1>Conversation {conversationId}</h1>
        </div>
    )
}

export default Page