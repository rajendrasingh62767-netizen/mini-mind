
"use client"

import { useState, useEffect } from "react"
import { notifications as initialNotifications, users, posts, getCurrentUser } from "@/lib/data"
import { User, Notification as NotificationType, Post } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Bell, ThumbsUp, UserPlus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from 'date-fns'
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
        const userNotifications = initialNotifications
            .filter(n => n.toUserId === user.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(userNotifications);
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    // In a real app, you'd also update this on the server
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
          {' '} liked {post ? <Link href="#" className="font-semibold hover:underline">{postContent}</Link> : 'your post'}.
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

                    return (
                      <li 
                        key={notification.id} 
                        className={cn(
                          "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
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
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                         {!notification.read && (
                            <div className="w-3 h-3 rounded-full bg-primary mt-1" title="Unread"></div>
                        )}
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
