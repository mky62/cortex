import Image from "next/image"


export const ConversationsView = () => {
    return (
        <div className="flex h-full flex-1 flex-col gap-y-4">
           <div className="flex flex-1 items-center justify-center gap-x-2">
            <Image  
            alt="Logo"
            src="/logo.png"
            width={40}
            height={40}
            />
                <p></p>
           </div>

        </div>
    )
}


