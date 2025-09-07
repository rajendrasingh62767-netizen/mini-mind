
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from 'next/navigation'
import { users as initialUsers } from "@/lib/data"
import { getLoggedInUser } from "@/lib/auth"
import { Conversation as ConversationType, User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInterface from "./components/chat-interface"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDocs, orderBy } from 'firebase/firestore'
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
  
  const conversationsCache = useRef<ConversationType[]>([]);

  useEffect(() => {
    setAllUsers(initialUsers); 
    const user = getLoggedInUser();
    if (user) {
        setCurrentUser(user);
    } else {
        router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    if (conversationsCache.current.length > 0) {
        setConversations(conversationsCache.current);
        setIsLoading(false);
    } else {
        setIsLoading(true);
    }

    const q = query(
      collection(db, "conversations"), 
      where("participantIds", "array-contains", currentUser.id),
      orderBy("lastMessage.timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const convos: ConversationType[] = [];
      for (const doc of querySnapshot.docs) {
        const convoData = doc.data();
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
      conversationsCache.current = convos;
      
      const conversationId = searchParams.get('conversationId');
      if (conversationId) {
        const convoToSelect = convos.find(c => c.id === conversationId);
        if(convoToSelect){
            setSelectedConversation(convoToSelect);
        }
      } else if (convos.length > 0 && !selectedConversation) {
        if (window.innerWidth >= 768) { 
           setSelectedConversation(convos[0]);
        }
      }
      setIsLoading(false);

    });

    return () => unsubscribe();

  }, [currentUser, searchParams]);

  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      const convoToSelect = conversations.find(c => c.id === conversationId);
      if(convoToSelect){
          setSelectedConversation(convoToSelect);
      }
    } else {
        setSelectedConversation(null);
    }
  }, [searchParams, conversations]);

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
            const existingConvo = { id: convoDoc.id, participantIds: convoDoc.data().participantIds, messages: [] };
             if(!conversations.some(c => c.id === existingConvo.id)) {
                setConversations(prev => [existingConvo, ...prev]);
            }
            handleSelectConversation(existingConvo);
        } else {
            const newConversationRef = await addDoc(collection(db, "conversations"), {
                participantIds: sortedParticipantIds,
                createdAt: serverTimestamp(),
                lastMessage: null
            });
            const newConvo = { id: newConversationRef.id, participantIds: sortedParticipantIds, messages: [] };
            setConversations(prev => [newConvo, ...prev]);
            handleSelectConversation(newConvo);
        }
    } catch(error) {
        console.error("Error selecting or creating conversation:", error);
    } finally {
        setIsCreatingConversation(false);
        setSearchTerm("");
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
    if (searchTerm.trim() === '') return true;
    const lowercasedSearch = searchTerm.toLowerCase();
    return (
        participant.name.toLowerCase().includes(lowercasedSearch) ||
        participant.username.toLowerCase().includes(lowercasedSearch)
    );
  });
  
  if (isLoading && conversationsCache.current.length === 0) return (
     <div className="flex items-center justify-center h-[calc(100vh-8rem)] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
  );
  
  const hasSelectedConversation = !!selectedConversation;

  return (
    <Card className="h-[calc(100vh-8rem)] w-full flex overflow-hidden">
       <div
        className={cn(
          "w-full md:w-1/3 border-r h-full flex-col flex",
          hasSelectedConversation && "hidden md:flex"
        )}
      >
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
                    {lastMessage ? (lastMessage.senderId === currentUser?.id ? `You: ${lastMessage.text}`: lastMessage.text) : 'No messages yet'}
                  </p>
                </div>
              </div>
            )
          })}
          {filteredUsers.length > 0 && <div className="p-2 text-xs font-semibold text-muted-foreground">New Conversation</div>}
           {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={cn("flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50", isCreatingConversation && "opacity-50 cursor-not-allowed")}
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
             {filteredConversations.length === 0 && searchTerm.trim() === '' && !isLoading && (
                 <div className="text-center text-sm text-muted-foreground p-8">
                    You have no conversations.
                </div>
            )}

        </ScrollArea>
      </div>
      <div className={cn(
          "w-full md:w-2/3 h-full flex-col",
          !hasSelectedConversation ? "hidden md:flex" : "flex"
        )}>
        {hasSelectedConversation && currentUser && selectedConversation ? (
          <ChatInterface key={selectedConversation.id} conversation={selectedConversation} currentUser={currentUser} />
        ) : (
          <div className="items-center justify-center h-full text-muted-foreground hidden md:flex">
            <p>Select a conversation or search for a user to start chatting.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
