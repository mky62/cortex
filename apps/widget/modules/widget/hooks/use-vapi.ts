import Vapi from "@vapi-ai/web";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { vapiSecretsAtom, widgetSettingsAtom, organizationIdAtom, contactSessionIdAtomFamily } from "../atoms/widget-atoms";


interface TranscriptMessage {
    role: 'user' | 'assistant';
    text: string;
}

interface UseVapiReturn {
    isSpeaking: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    transcript: TranscriptMessage[];
    conversationId: Id<"conversations"> | null;
    endCall: () => void;
    startCall: () => void;
}

export const useVapi = (onConversationCreated?: (conversationId: Id<"conversations">) => void) => {
    const vapiSecrets = useAtomValue(vapiSecretsAtom);
    const widgetSettings = useAtomValue(widgetSettingsAtom);
    const organizationId = useAtomValue(organizationIdAtom);
    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));

    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

    const createVoiceConversation = useMutation(api.public.conversations.createVoice);
    const updateVoiceTranscript = useMutation(api.public.conversations.updateVoiceTranscript);
    const completeVoiceConversation = useMutation(api.public.conversations.completeVoiceConversation);

    useEffect(() => {

    if (!vapiSecrets) {
        return;
    }

    const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
    setVapi(vapiInstance);

        setVapi(vapiInstance);

        vapiInstance.on("call-start", async () => {
            setIsConnected(true);
            setIsConnecting(true);
            setTranscript([]);
            setConversationId(null);

            // Create voice conversation in backend
            if (organizationId && contactSessionId) {
                try {
                    const newConversationId = await createVoiceConversation({
                        organizationId,
                        contactSessionId,
                    });
                    setConversationId(newConversationId);
                    onConversationCreated?.(newConversationId);
                } catch (error) {
                    console.error("Failed to create voice conversation:", error);
                }
            }
        })

        vapiInstance.on("call-end", async () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);

            // Complete voice conversation in backend
            if (conversationId && contactSessionId) {
                try {
                    await completeVoiceConversation({
                        conversationId,
                        contactSessionId,
                    });
                } catch (error) {
                    console.error("Failed to complete voice conversation:", error);
                }
            }
            setConversationId(null);
        })

          vapiInstance.on("speech-start", () => {
            setIsSpeaking(true)
        })

         vapiInstance.on("speech-end", () => {
            setIsSpeaking(false)
        })

         vapiInstance.on("error", () => {
            console.log()
            setIsConnecting(false);
        });

        vapiInstance.on("message", async (message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const role: 'user' | 'assistant' = message.role === "user" ? "user" : "assistant";
                const newMessage: TranscriptMessage = {
                    role,
                    text: message.transcript,
                };
                
                setTranscript((prev) => [...prev, newMessage]);

                // Persist transcript to backend
                if (conversationId && contactSessionId) {
                    try {
                        const transcriptRole: 'user' | 'assistant' = role === 'user' ? 'user' : 'assistant';
                        await updateVoiceTranscript({
                            conversationId,
                            contactSessionId,
                            role: transcriptRole,
                            text: message.transcript,
                        });
                    } catch (error) {
                        console.error("Failed to update voice transcript:", error);
                    }
                }
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
    if (!vapiSecrets || !widgetSettings?.vapiSettings?.assistantId) {
      return;
    }
    setIsConnecting(true);

    if (vapi) {
      vapi.start(widgetSettings.vapiSettings.assistantId);
    }
  }
    const endCall = () => {
        if (vapi) {
            vapi.stop();
        }
    };

    return {
        isSpeaking,
        isConnected,
        isConnecting,
        transcript,
        conversationId,
        endCall,
        startCall,
    };
};