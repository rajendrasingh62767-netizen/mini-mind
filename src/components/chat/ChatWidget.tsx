"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import { conversations, users, currentUser } from "@/lib/data"
import { Conversation as ConversationType } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'
import ChatInterface from "@/app/(main)/messages/components/chat-interface"

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null)

  const getParticipant = (convo: ConversationType) => {
    const participantId = convo.participantIds.find(id => id !== currentUser.id)
    return users.find(user => user.id === participantId)
  }

  const handleConversationSelect = (convo: ConversationType) => {
    setSelectedConversation(convo)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg"
          size="icon"
        >
          {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[400px] h-[600px] p-0 rounded-lg overflow-hidden flex flex-col"
        sideOffset={20}
      >
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            <header className="p-4 border-b flex items-center justify-between">
              <button onClick={() => setSelectedConversation(null)} className="font-semibold hover:underline">
                &larr; Back to conversations
              </button>
            </header>
            <ChatInterface conversation={selectedConversation} />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <header className="p-4 border-b">
              <h2 className="text-xl font-bold">Messages</h2>
            </header>
            <ScrollArea className="flex-1">
              {conversations.map((convo) => {
                const participant = getParticipant(convo)
                if (!participant) return null
                const lastMessage = convo.messages[convo.messages.length - 1];

                return (
                  <div
                    key={convo.id}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleConversationSelect(convo)}
                  >
                    <Avatar>
                      <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold truncate">{participant.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {format(new Date(lastMessage.timestamp), 'p')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
