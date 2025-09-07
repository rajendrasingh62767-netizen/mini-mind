"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from 'next/navigation'
import { users as initialUsers, getCurrentUser } from "@/lib/data"
import { Conversation as ConversationType, User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInterface from "./components/chat-interface"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from 'date-fns'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp, doc, getDoc, orderBy } from 'firebase/firestore'
import { db } from "@/lib/firebase"


export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationType[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    // In a real app, you might fetch this from a 'users' collection in Firestore
    setAllUsers(initialUsers); 
    const user = getCurrentUser();
    if (user) {
        setCurrentUser(user);
    } else {
        router.push('/login');
    }
  }, [router]);

 useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    const q = query(
      collection(db, "conversations"), 
      where("participantIds", "array-contains", currentUser.id),
      orderBy("lastMessage.timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const convos: ConversationType[] = [];
      for (const doc of querySnapshot.docs) {
        const convoData = doc.data();
        const participantId = convoData.participantIds.find((id: string) => id !== currentUser.id);
        const lastMessage = convoData.lastMessage ? {
            ...convoData.lastMessage,
            timestamp: convoData.lastMessage.timestamp?.toDate ? convoData.lastMessage.timestamp.toDate().toISOString() : new Date().toISOString(),
        } : null;

        convos.push({
          id: doc.id,
          participantIds: convoData.participantIds,
          messages: [], // messages will be fetched in ChatInterface
          lastMessage: lastMessage,
        });
      }

      setConversations(convos);
      setIsLoading(false);
      
      const conversationId = searchParams.get('conversationId');
      if (conversationId) {
        const convoToSelect = convos.find(c => c.id === conversationId);
        if(convoToSelect){
            setSelectedConversation(convoToSelect);
        }
      } else if (convos.length > 0 && !selectedConversation) {
        setSelectedConversation(convos[0]);
      }

    });

    return () => unsubscribe();

  }, [currentUser, searchParams, selectedConversation]);

  const getParticipant = useCallback((convo: ConversationType) => {
    if (!currentUser) return null;
    const participantId = convo.participantIds.find(id => id !== currentUser.id)
    return allUsers.find(user => user.id === participantId)
  }, [currentUser, allUsers]);

  const handleSelectConversation = (convo: ConversationType) => {
    setSelectedConversation(convo);
    router.push(`/messages?conversationId=${convo.id}`, { scroll: false });
  }

  const handleSelectUser = async (user: User) => {
    if (!currentUser || isCreatingConversation) return;
    setIsCreatingConversation(true);

    try {
        const sortedParticipantIds = [currentUser.id, user.id].sort();
        const q = query(
            collection(db, "conversations"),
            where("participantIds", "==", sortedParticipantIds)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const convoDoc = querySnapshot.docs[0];
            handleSelectConversation({ id: convoDoc.id, participantIds: convoDoc.data().participantIds, messages: [] });
        } else {
            const newConversationRef = await addDoc(collection(db, "conversations"), {
                participantIds: sortedParticipantIds,
                createdAt: serverTimestamp(),
                lastMessage: null
            });
            handleSelectConversation({ id: newConversationRef.id, participantIds: sortedParticipantIds, messages: [] });
        }
    } catch(error) {
        console.error("Error selecting or creating conversation:", error);
    } finally {
        setIsCreatingConversation(false);
    }
  }
  
  const filteredUsers = searchTerm.trim() !== '' ? allUsers.filter(user => {
    if (!currentUser || user.id === currentUser.id) return false;
    
    const conversationExists = conversations.some(c => c.participantIds.includes(user.id));
    if(conversationExists) return false;

    const lowercasedSearch = searchTerm.toLowerCase();
    return (
        user.name.toLowerCase().includes(lowercasedSearch) ||
        user.username.toLowerCase().includes(lowercasedSearch)
    );
  }) : [];


  const filteredConversations = conversations.filter(convo => {
    const participant = getParticipant(convo);
    if (!participant) return false;
    const lowercasedSearch = searchTerm.toLowerCase();
    return (
        participant.name.toLowerCase().includes(lowercasedSearch) ||
        participant.username.toLowerCase().includes(lowercasedSearch)
    );
  });
  
  if (!currentUser || isLoading) return (
     <div className="flex items-center justify-center h-[calc(100vh-8rem)] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
  );

  return (
    <Card className="h-[calc(100vh-8rem)] w-full flex">
      <div className="w-full md:w-1/3 border-r h-full flex-col md:flex">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight font-headline">Messages</h1>
          </div>
          <Input 
            placeholder="Search or start new chat..." 
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
            const lastMessage = convo.lastMessage;

            return (
              <div
                key={convo.id}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50",
                  selectedConversation?.id === convo.id && "bg-muted"
                )}
                onClick={() => handleSelectConversation(convo)}
              >
                <Avatar>
                  <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{participant.name}</p>
                     {lastMessage?.timestamp && <p className="text-xs text-muted-foreground truncate">
                        {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                    </p>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage ? (lastMessage.senderId === currentUser.id ? `You: ${lastMessage.text}`: lastMessage.text) : 'No messages yet'}
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
                aria-disabled={isCreatingConversation}
              >
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                </div>
                {isCreatingConversation && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            ))}
            {filteredConversations.length === 0 && filteredUsers.length === 0 && searchTerm.trim() !== '' && (
                <div className="text-center text-sm text-muted-foreground p-8">
                    No users or conversations found.
                </div>
            )}

        </ScrollArea>
      </div>
      <div className="w-2/3 h-full hidden md:flex flex-col">
        {selectedConversation ? (
          <ChatInterface key={selectedConversation.id} conversation={selectedConversation} currentUser={currentUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a conversation or search for a user to start chatting.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
