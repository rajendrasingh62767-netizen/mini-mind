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
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, writeBatch } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"


interface ChatInterfaceProps {
  conversation: ConversationType,
  currentUser: User
}

export default function ChatInterface({ conversation: initialConversation, currentUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [participant, setParticipant] = useState<User | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const participantId = initialConversation.participantIds.find(id => id !== currentUser.id)
    if (participantId) {
        const foundParticipant = users.find(user => user.id === participantId)
        setParticipant(foundParticipant || null);
    }
  }, [initialConversation, currentUser.id]);

  useEffect(() => {
    if (!initialConversation.id) return;
    
    setIsLoading(true);
    const q = query(collection(db, "conversations", initialConversation.id, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [initialConversation.id]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !participant) return;

    const text = newMessage;
    setNewMessage("");

    const messagesColRef = collection(db, "conversations", initialConversation.id, "messages");
    const conversationDocRef = doc(db, "conversations", initialConversation.id);

    try {
        const batch = writeBatch(db);

        // Add new message
        batch.set(doc(messagesColRef), {
            senderId: currentUser.id,
            text: text,
            timestamp: serverTimestamp(),
        });

        // Update last message on conversation
        batch.update(conversationDocRef, {
            lastMessage: {
                senderId: currentUser.id,
                text: text,
                timestamp: serverTimestamp(),
            }
        });

        await batch.commit();

    } catch (error) {
        console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!participant) {
    return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Could not load participant details.</p>
        </div>
    )
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex items-center gap-3">
         <Link href="/messages" className="md:hidden mr-2">
            <Button variant="ghost" size="icon">
                <ArrowLeft />
            </Button>
        </Link>
        <Avatar>
          <AvatarImage src={participant.avatarUrl} alt={participant.name} />
          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-lg">{participant.name}</h2>
      </header>
      <ScrollArea className="flex-1 bg-muted/20">
        <div className="p-4 space-y-4" ref={viewportRef}>
          {messages.map((message) => {
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
                    "rounded-lg px-4 py-2 max-w-xs lg:max-w-md shadow-sm",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                   <p className={cn("text-xs mt-1 text-right", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {format(new Date(message.timestamp), 'p')}
                    </p>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
