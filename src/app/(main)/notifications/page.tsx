
"use client"

import { useState, useEffect } from "react"
import { users } from "@/lib/data"
import { getLoggedInUser } from "@/lib/auth"
import { User, Notification as NotificationType } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Bell, ThumbsUp, UserPlus, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from 'date-fns'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { collection, query, where, onSnapshot, doc, getDocs, updateDoc, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from "@/lib/firebase"


export default function NotificationsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const user = getLoggedInUser();
    setCurrentUser(user);

    if (user) {
        // Fetch posts to show context in 'like' notifications
        const postUnsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
            const postData: any[] = [];
            snapshot.forEach(doc => postData.push({ id: doc.id, ...doc.data() }));
            setPosts(postData);
        });

        // Listen for notifications for the current user
        const q = query(
            collection(db, "notifications"), 
            where("toUserId", "==", user.id),
            orderBy("timestamp", "desc")
        );
        const notifUnsubscribe = onSnapshot(q, (snapshot) => {
            const notifs: NotificationType[] = [];
            snapshot.forEach(doc => {
                notifs.push({ id: doc.id, ...doc.data() } as NotificationType);
            });
            setNotifications(notifs);
        });
        
         // Listen to who the current user is following
        const followingQuery = query(collection(db, "notifications"), where("type", "==", "follow"), where("fromUserId", "==", user.id));
        const followingUnsubscribe = onSnapshot(followingQuery, (snapshot) => {
            const ids = new Set(snapshot.docs.map(doc => doc.data().toUserId));
            setFollowingIds(ids);
        });

        return () => {
            postUnsubscribe();
            notifUnsubscribe();
            followingUnsubscribe();
        };
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, { read: true });
  };

  const handleFollowBack = async (followerId: string) => {
    if (!currentUser || followingIds.has(followerId)) return;

    const notificationsRef = collection(db, "notifications");
     await addDoc(notificationsRef, {
        type: 'follow',
        fromUserId: currentUser.id,
        toUserId: followerId,
        timestamp: serverTimestamp(),
        read: false,
    });
  };
  
  const isFollowing = (userId: string) => {
    return followingIds.has(userId);
  };


  if (!currentUser) return <p>Loading...</p>;

  const renderNotificationText = (notification: NotificationType) => {
    const fromUser = users.find(u => u.id === notification.fromUserId);
    if (!fromUser) return null;

    if (notification.type === 'like') {
      const post = posts.find(p => p.id === notification.postId);
      const postContent = post ? `"${post.content.substring(0, 30)}..."` : "your post";
      return (
        <p>
          <Link href={`/profile/${fromUser.id}`} className="font-semibold hover:underline">{fromUser.name}</Link>
          {' '} liked {post ? <Link href={`/feed`} className="font-semibold hover:underline">{postContent}</Link> : 'your post'}.
        </p>
      )
    }

    if (notification.type === 'follow') {
      return (
        <p>
          <Link href={`/profile/${fromUser.id}`} className="font-semibold hover:underline">{fromUser.name}</Link>
          {' '} started following you.
        </p>
      )
    }
    return null;
  }
  
  const getNotificationIcon = (notification: NotificationType) => {
    if (notification.type === 'like') {
        return <ThumbsUp className="w-6 h-6 text-blue-500" />
    }
     if (notification.type === 'follow') {
        return <UserPlus className="w-6 h-6 text-green-500" />
    }
    return <Bell className="w-6 h-6" />
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
             <Button variant="ghost" size="icon" onClick={() => router.push('/feed')} className="md:hidden">
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Bell className="w-6 h-6" />
            </div>
            <div>
                <CardTitle className="text-2xl font-bold font-headline">Notifications</CardTitle>
                <CardDescription>
                Your recent activity and updates.
                </CardDescription>
            </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <ul className="divide-y">
                {notifications.map(notification => {
                    const fromUser = users.find(u => u.id === notification.fromUserId);
                    if (!fromUser) return null;
                    const alreadyFollowing = isFollowing(fromUser.id);
                    const timeAgo = notification.timestamp?.toDate ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true }) : 'just now';

                    return (
                      <li 
                        key={notification.id} 
                        className={cn(
                          "flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
                          !notification.read && "bg-primary/5"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                         <div className="p-2 bg-background rounded-full border shadow-sm">
                            {getNotificationIcon(notification)}
                         </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={fromUser.avatarUrl} />
                                    <AvatarFallback>{fromUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    {renderNotificationText(notification)}
                                </div>
                            </div>
                           <p className="text-xs text-muted-foreground mt-1 pl-10">
                                {timeAgo}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {notification.type === 'follow' && (
                                <Button 
                                    size="sm" 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent li onClick from firing
                                        handleFollowBack(fromUser.id);
                                    }}
                                    disabled={alreadyFollowing}
                                >
                                    {alreadyFollowing ? <Check className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    {alreadyFollowing ? 'Following' : 'Follow Back'}
                                </Button>
                            )}
                            {!notification.read && (
                                <div className="w-3 h-3 rounded-full bg-primary" title="Unread"></div>
                            )}
                        </div>
                      </li>
                    )
                })}
            </ul>
          ) : (
             <div className="p-10 text-center text-muted-foreground">
                <Bell className="mx-auto w-12 h-12 mb-4" />
                <p>You have no notifications yet.</p>
                <p className="text-sm">When you get likes or new followers, they will show up here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
