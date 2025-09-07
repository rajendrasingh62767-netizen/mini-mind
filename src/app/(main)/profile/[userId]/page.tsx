
"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { users as initialUsers, getFollowers, getFollowing, followUser, unfollowUser } from "@/lib/data"
import PostCard from "../../feed/components/post-card"
import { Pencil, MessageSquare, UserPlus, Check, UserX, ArrowLeft, Grid3x3, AlignJustify, Loader2 } from "lucide-react"
import { notFound, useRouter } from "next/navigation"
import EditProfileDialog from "./components/edit-profile-form"
import { User, Post } from "@/lib/types"
import { getLoggedInUser, saveUserToLocalStorage } from "@/lib/auth"
import FollowersListDialog from "./components/followers-list-dialog"
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [hoveringFollow, setHoveringFollow] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  
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
    if (!user) return;

     // Listen for posts by the user
    const postsQuery = query(collection(db, "posts"), where("authorId", "==", user.id), orderBy("timestamp", "desc"));
    const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData: Post[] = [];
        snapshot.forEach(doc => postsData.push({ id: doc.id, ...doc.data() } as Post));
        setUserPosts(postsData);
        setIsLoading(false);
    });

    return () => postsUnsubscribe();
  }, [user?.id]);


  useEffect(() => {
    if (currentUser && user) {
        // Check if current user is following the profile user
        const notifQuery = query(collection(db, "notifications"), 
            where("type", "==", "follow"),
            where("fromUserId", "==", currentUser.id),
            where("toUserId", "==", user.id)
        );
        const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
            setIsFollowing(!snapshot.empty);
        });

        // Get followers and following lists
        const updateFollows = async () => {
            const followersList = await getFollowers(user.id);
            const followingList = await getFollowing(user.id);
            setFollowers(followersList);
            setFollowing(followingList);
        };
        updateFollows();

        // Also listen for changes to update follow counts in real-time
         const followListenerQuery = query(collection(db, "notifications"), where("type", "==", "follow"));
         const followUnsubscribe = onSnapshot(followListenerQuery, (snapshot) => {
              updateFollows();
         });

        return () => {
            unsubscribe();
            followUnsubscribe();
        }
    }
  }, [currentUser, user]);


  if (!user) {
    return notFound();
  }

  const isCurrentUser = currentUser ? user.id === currentUser.id : false;

  const handleProfileUpdate = (updatedUser: User) => {
    // In a real app, we'd update this in the database.
    // For now, update local state.
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    initialUsers.splice(initialUsers.findIndex(u => u.id === updatedUser.id), 1, updatedUser);
    
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
          lastMessage: null,
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
  }
  
  const handleUnfollow = () => {
    if (!currentUser || !user) return;
    unfollowUser(currentUser.id, user.id);
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
                     <Button variant="ghost" size="icon" onClick={() => router.push('/feed')} className="sm:hidden">
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
                     <Button variant="ghost" size="icon" onClick={() => router.push('/feed')} className="hidden sm:inline-flex">
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
                 <span className="text-muted-foreground">&middot;</span>
                 <p><span className="font-bold">{userPosts.length}</span> Posts</p>
              </div>

              <p className="text-muted-foreground pt-2">{user.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-center border-b">
           <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex-1 p-3 text-sm font-medium flex justify-center items-center gap-2",
                viewMode === 'grid' ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              )}
            >
              <Grid3x3 className="w-4 h-4"/>
              Grid
           </button>
            <button 
                onClick={() => setViewMode('feed')}
                className={cn(
                    "flex-1 p-3 text-sm font-medium flex justify-center items-center gap-2",
                    viewMode === 'feed' ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                )}
            >
              <AlignJustify className="w-4 h-4"/>
              Feed
            </button>
        </div>

        <div className="pt-6">
        {isLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : userPosts.length > 0 ? (
           viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
                  {userPosts.filter(p => p.mediaUrl && p.mediaType === 'image').map((post) => (
                      <div key={post.id} className="relative aspect-square">
                        <Image src={post.mediaUrl!} alt={post.content ?? 'Post image'} fill className="object-cover rounded-md" />
                      </div>
                  ))}
                </div>
           ) : (
             <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} author={user} />
              ))}
             </div>
           )
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {isCurrentUser ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}
