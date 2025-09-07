"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { users as initialUsers, posts as initialPosts, getFollowers, getFollowing, notifications, followUser, unfollowUser } from "@/lib/data"
import PostCard from "../../feed/components/post-card"
import { Pencil, MessageSquare, UserPlus, Check, UserX, ArrowLeft } from "lucide-react"
import { notFound, useRouter } from "next/navigation"
import EditProfileDialog from "./components/edit-profile-form"
import { User } from "@/lib/types"
import { getLoggedInUser, saveUserToLocalStorage } from "@/lib/auth"
import FollowersListDialog from "./components/followers-list-dialog"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [hoveringFollow, setHoveringFollow] = useState(false);
  
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
        const followExists = notifications.some(
            n => n.type === 'follow' &&
            n.fromUserId === currentUser.id && n.toUserId === user.id
        );
        setIsFollowing(followExists);
        setFollowers(getFollowers(user.id));
        setFollowing(getFollowing(user.id));
    }
  }, [currentUser, user, notifications]);


  if (!user) {
    return notFound();
  }

  const userPosts = initialPosts.filter((post) => post.authorId === user.id)
  const isCurrentUser = currentUser ? user.id === currentUser.id : false;

  const handleProfileUpdate = (updatedUser: User) => {
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    
    if (isCurrentUser) {
        setCurrentUser(updatedUser);
        saveUserToLocalStorage(updatedUser);
    }
  }

  const handleMessage = async () => {
    if (!currentUser || !user || currentUser.id === user.id) return;

    try {
      const sortedParticipantIds = [currentUser.id, user.id].sort();
      
      const q = query(
        collection(db, "conversations"),
        where("participantIds", "==", sortedParticipantIds)
      );

      const querySnapshot = await getDocs(q);

      let conversationId: string;

      if (!querySnapshot.empty) {
        conversationId = querySnapshot.docs[0].id;
      } else {
        const newConversationRef = await addDoc(collection(db, "conversations"), {
          participantIds: sortedParticipantIds,
          createdAt: serverTimestamp(),
        });
        conversationId = newConversationRef.id;
      }
      
      router.push(`/messages?conversationId=${conversationId}`);
    } catch (error) {
      console.error("Error creating or fetching conversation:", error);
    }
  }

  const handleFollow = () => {
    if (!currentUser || !user) return;
    followUser(currentUser.id, user.id);
    setIsFollowing(true);
    setFollowers(getFollowers(user.id)); // Refresh followers list
  }
  
  const handleUnfollow = () => {
    if (!currentUser || !user) return;
    unfollowUser(currentUser.id, user.id);
    setIsFollowing(false);
    setFollowers(getFollowers(user.id)); // Refresh followers list
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
                <div className="flex items-center gap-4">
                     <Button variant="ghost" size="icon" onClick={() => router.back()} className="sm:hidden">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                        <p className="text-muted-foreground text-lg">@{user.username}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isCurrentUser ? (
                    <EditProfileDialog user={user} onProfileUpdate={handleProfileUpdate}>
                        <Button variant="outline">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                        </Button>
                    </EditProfileDialog>
                    ) : (
                        <div className="flex gap-2">
                           {isFollowing ? (
                              <Button 
                                variant={hoveringFollow ? "destructive" : "outline"}
                                onMouseEnter={() => setHoveringFollow(true)}
                                onMouseLeave={() => setHoveringFollow(false)}
                                onClick={handleUnfollow}
                              >
                                {hoveringFollow ? <UserX className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                                {hoveringFollow ? "Unfollow" : "Following"}
                              </Button>
                            ) : (
                              <Button onClick={handleFollow}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Follow
                              </Button>
                            )}
                            <Button variant="outline" onClick={handleMessage}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                            </Button>
                        </div>
                    )}
                     <Button variant="ghost" size="icon" onClick={() => router.back()} className="hidden sm:inline-flex">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </Button>
                </div>
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              
               <div className="flex items-center gap-4 pt-2 text-sm">
                <FollowersListDialog title="Following" users={following}>
                  <button type="button" className="hover:underline">
                    <span className="font-bold">{following.length}</span> Following
                  </button>
                </FollowersListDialog>
                <FollowersListDialog title="Followers" users={followers}>
                  <button type="button" className="hover:underline">
                    <span className="font-bold">{followers.length}</span> Followers
                  </button>
                </FollowersListDialog>
              </div>

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
