"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { users as initialUsers, posts as initialPosts, getCurrentUser, conversations, notifications } from "@/lib/data"
import PostCard from "../../feed/components/post-card"
import { Pencil, MessageSquare, UserPlus, Check } from "lucide-react"
import { notFound, useRouter } from "next/navigation"
import EditProfileDialog from "./components/edit-profile-form"
import { User } from "@/lib/types"
import { getLoggedInUser, saveUserToLocalStorage } from "@/lib/auth"

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
        router.push('/login');
    } else {
        setCurrentUser(loggedInUser)
    }
  }, [router]);
  
  const user = users.find((u) => u.id === params.userId)

  useEffect(() => {
    if (currentUser && user) {
        // In a real app, you'd check a connections list from an API
        // For this demo, we'll check if a "follow" notification exists
        const followExists = notifications.some(
            n => n.type === 'follow' &&
            n.fromUserId === currentUser.id && n.toUserId === user.id
        );
        setIsFollowing(followExists);
    }
  }, [currentUser, user]);


  if (!user) {
    return notFound();
  }

  const userPosts = initialPosts.filter((post) => post.authorId === user.id)
  const isCurrentUser = currentUser ? user.id === currentUser.id : false;

  const handleProfileUpdate = (updatedUser: User) => {
    // In a real app, this would be an API call to update the user in the database.
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    
    // If the updated user is the current user, also update the data in localStorage
    if (isCurrentUser) {
        setCurrentUser(updatedUser);
        saveUserToLocalStorage(updatedUser);
    }
  }

  const handleMessage = () => {
    if (!currentUser) return;
    
    // Check if a conversation already exists
    let conversation = conversations.find(c => 
        c.participantIds.includes(currentUser.id) && c.participantIds.includes(user.id)
    );

    if (!conversation) {
        // Create a new conversation if one doesn't exist
        conversation = {
            id: `conv-${Date.now()}`,
            participantIds: [currentUser.id, user.id],
            messages: []
        };
        conversations.unshift(conversation); // Add to the beginning of the list
    }
    
    // Redirect to the messages page, with the new/existing conversation selected
    router.push(`/messages?conversationId=${conversation.id}`);
  }

  const handleFollow = () => {
    if (isFollowing || !currentUser) return;

    setIsFollowing(true)
    notifications.unshift({
      id: `notif-${Date.now()}`,
      type: 'follow',
      fromUserId: currentUser.id,
      toUserId: user.id,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }
  
  if (!currentUser) {
    return <p>Loading profile...</p>
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-card">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {isCurrentUser && (
                <EditProfileDialog user={user} onProfileUpdate={handleProfileUpdate}>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Pencil className="h-8 w-8 text-white" />
                  </div>
                </EditProfileDialog>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                    <p className="text-muted-foreground text-lg">@{user.username}</p>
                </div>
                {isCurrentUser ? (
                   <EditProfileDialog user={user} onProfileUpdate={handleProfileUpdate}>
                    <Button variant="outline">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </EditProfileDialog>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleFollow} disabled={isFollowing}>
                            {isFollowing ? <Check className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button variant="outline" onClick={handleMessage}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                    </div>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-muted-foreground pt-2">{user.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight font-headline">{isCurrentUser ? "Your" : `${user.name.split(' ')[0]}'s`} Posts</h2>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard key={post.id} post={post} author={user} />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {isCurrentUser ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
