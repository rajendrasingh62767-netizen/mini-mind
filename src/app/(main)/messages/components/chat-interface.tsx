"use client"

import { useState, useRef, useEffect } from "react"
import { Conversation as ConversationType, User, Message } from "@/lib/types"
import { users } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'
import { getAiResponse } from "../actions"

interface ChatInterfaceProps {
  conversation: ConversationType,
  currentUser: User
}

export default function ChatInterface({ conversation: initialConversation, currentUser }: ChatInterfaceProps) {
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const participantId = conversation.participantIds.find(id => id !== currentUser.id)
  const participant = users.find(user => user.id === participantId)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setConversation(initialConversation);
    setMessages(initialConversation.messages);
  }, [initialConversation]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || !participant) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setNewMessage("");
    setIsLoading(true);

    const result = await getAiResponse({
      history: messages,
      newMessage: newMessage,
      currentUser: currentUser,
      participant: participant,
    });

    if (result.success && participant) {
        const aiMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            senderId: participant.id,
            text: result.data,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
    } else {
        // Handle error - maybe show a toast or an error message in chat
        console.error("Failed to get AI response:", result.error);
        const errorMessage: Message = {
            id: `err-${Date.now()}`,
            senderId: 'system',
            text: `Error: ${result.error || 'Could not get response.'}`,
            timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

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
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4" ref={viewportRef}>
          {messages.map((message) => {
            if (message.senderId === 'system') {
                 return (
                    <div key={message.id} className="text-center text-xs text-destructive">
                        <p>{message.text}</p>
                    </div>
                )
            }
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
           {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <Avatar className="w-8 h-8">
                <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :<Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
