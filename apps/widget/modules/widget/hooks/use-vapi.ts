import Vapi from "@vapi-ai/web";
import { start } from "node:repl";
import { useEffect, useState } from "react";


interface TranscriptMessage {
    role: 'user' | 'assistant';
    text: string;
};

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

    useEffect(() => {
        const vapiInstance = new Vapi('cb1ee095-9018-4e46-9444-29773dbf5973')

        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true);
            setIsConnecting(true);
            setTranscript([])
        })

          vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false)
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

         vapiInstance.on("message", (message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user" ? "user" : "assistant",
                        text: message.transcript,
                    }
                ])
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        setIsConnecting(true);

        if (vapi) {
            vapi.start('cb1ee095-9018-4e46-9444-29773dbf5973');
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
        endCall,
        startCall
    }
}