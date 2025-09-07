"use client"

import { useState, useEffect } from "react"
import { conversations, users, getCurrentUser } from "@/lib/data"
import { Conversation as ConversationType, User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInterface from "./components/chat-interface"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(conversations[0] || null)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  if (!currentUser) return <p>Loading...</p>

  const getParticipant = (convo: ConversationType) => {
    const participantId = convo.participantIds.find(id => id !== currentUser.id)
    return users.find(user => user.id === participantId)
  }

  return (
    <Card className="h-[calc(100vh-8rem)] w-full flex">
      <div className="w-1/3 border-r h-full flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight font-headline">Messages</h1>
          <Input placeholder="Search messages..." className="mt-2" />
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((convo) => {
            const participant = getParticipant(convo)
            if (!participant) return null
            const lastMessage = convo.messages[convo.messages.length - 1];

            return (
              <div
                key={convo.id}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50",
                  selectedConversation?.id === convo.id && "bg-muted"
                )}
                onClick={() => setSelectedConversation(convo)}
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
      <div className="w-2/3 h-full">
        {selectedConversation ? (
          <ChatInterface conversation={selectedConversation} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
