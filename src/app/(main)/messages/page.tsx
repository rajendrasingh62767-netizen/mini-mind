
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
import { conversations as initialConversations, users, getCurrentUser } from "@/lib/data"
import { Conversation as ConversationType, User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInterface from "./components/chat-interface"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'
import { useRouter } from "next/navigation"

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (currentUser) {
        const conversationId = searchParams.get('conversationId');
        if (conversationId) {
            const convo = initialConversations.find(c => c.id === conversationId);
            setSelectedConversation(convo || initialConversations[0] || null);
        } else {
            setSelectedConversation(initialConversations[0] || null);
        }
    }
  }, [searchParams, currentUser]);


  if (!currentUser) return <p>Loading...</p>

  const getParticipant = (convo: ConversationType) => {
    const participantId = convo.participantIds.find(id => id !== currentUser.id)
    return users.find(user => user.id === participantId)
  }

  const handleSelectUser = (user: User) => {
    // Check if a conversation already exists
    let conversation = conversations.find(c => 
        c.participantIds.includes(currentUser.id) && c.participantIds.includes(user.id)
    );

    if (conversation) {
        setSelectedConversation(conversation);
        router.push(`/messages?conversationId=${conversation.id}`);
    } else {
        // Create a new conversation if one doesn't exist
        const newConversation: ConversationType = {
            id: `conv-${Date.now()}`,
            participantIds: [currentUser.id, user.id],
            messages: []
        };
        const updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        setSelectedConversation(newConversation);
        router.push(`/messages?conversationId=${newConversation.id}`);
    }
  }

  const filteredConversations = conversations.filter(convo => {
    const participant = getParticipant(convo);
    if (!participant) return false;
    const lowercasedSearch = searchTerm.toLowerCase();
    return (
        participant.name.toLowerCase().includes(lowercasedSearch) ||
        participant.username.toLowerCase().includes(lowercasedSearch) ||
        participant.id.toLowerCase().includes(lowercasedSearch)
    );
  });
  
  const conversationParticipantIds = new Set(
    conversations.flatMap(c => c.participantIds)
  );

  const filteredUsers = searchTerm.trim() !== '' ? users.filter(user => {
    if (user.id === currentUser.id) return false; // Exclude current user
    if (conversationParticipantIds.has(user.id)) return false; // Exclude users already in conversations list

    const lowercasedSearch = searchTerm.toLowerCase();
    return (
        user.name.toLowerCase().includes(lowercasedSearch) ||
        user.username.toLowerCase().includes(lowercasedSearch) ||
        user.id.toLowerCase().includes(lowercasedSearch)
    );
  }) : [];


  return (
    <Card className="h-[calc(100vh-8rem)] w-full flex">
      <div className="w-1/3 border-r h-full flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight font-headline">Messages</h1>
          <Input 
            placeholder="Search by name, username, or ID..." 
            className="mt-2" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations.length > 0 && <div className="p-2 text-xs font-semibold text-muted-foreground">Conversations</div>}
          {filteredConversations.map((convo) => {
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
                     {lastMessage && <p className="text-xs text-muted-foreground truncate">
                        {format(new Date(lastMessage.timestamp), 'p')}
                    </p>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage ? lastMessage.text : 'No messages yet'}
                  </p>
                </div>
              </div>
            )
          })}
          {filteredUsers.length > 0 && <div className="p-2 text-xs font-semibold text-muted-foreground">New Conversation</div>}
           {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => handleSelectUser(user)}
              >
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                </div>
              </div>
            ))}
            {filteredConversations.length === 0 && filteredUsers.length === 0 && searchTerm.trim() !== '' && (
                <div className="text-center text-sm text-muted-foreground p-8">
                    No users or conversations found.
                </div>
            )}

        </ScrollArea>
      </div>
      <div className="w-2/3 h-full">
        {selectedConversation ? (
          <ChatInterface conversation={selectedConversation} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a conversation or search for a user to start chatting.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
