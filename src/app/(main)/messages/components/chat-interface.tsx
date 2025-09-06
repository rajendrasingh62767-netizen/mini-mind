"use client"

import { Conversation as ConversationType, User } from "@/lib/types"
import { currentUser, users } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'

interface ChatInterfaceProps {
  conversation: ConversationType
}

export default function ChatInterface({ conversation }: ChatInterfaceProps) {
  const participantId = conversation.participantIds.find(id => id !== currentUser.id)
  const participant = users.find(user => user.id === participantId)

  if (!participant) return null;

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={participant.avatarUrl} alt={participant.name} />
          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-lg">{participant.name}</h2>
      </header>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.messages.map((message) => {
            const sender = message.senderId === currentUser.id ? currentUser : participant
            const isCurrentUser = message.senderId === currentUser.id
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={sender.avatarUrl} alt={sender.name} />
                    <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-xs lg:max-w-md",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                   <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {format(new Date(message.timestamp), 'p')}
                    </p>
                </div>
                 {isCurrentUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={sender.avatarUrl} alt={sender.name} />
                    <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t">
        <form className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
