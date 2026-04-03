'use client'

import { useVapi } from "@/modules/widget/hooks/use-vapi";
import { Button } from "@workspace/ui/components/button";


export default function Page() {
    const {
      isConnected,  
      isConnecting,
      isSpeaking,
      transcript,
      startCall,
      endCall
    } = useVapi();

    return (
      <div
      className="flex flex-col items-center jsutify-center min-h-svh">
        <h1 className="text-2xl font-bold mb-4">Widget</h1>
       <Button
       onClick={() => startCall()}>
        start
       </Button>
       <Button
       onClick={() => endCall()}></Button>
       <p>isConnected: {`${isConnected}`}</p>
            <p>isConnecting: {`${isConnecting}`}</p>
       <p>isSpeaking: {`${isSpeaking}`}</p>
       <p>{JSON.stringify(transcript, null, 2)}</p>
      </div>
    )
}
