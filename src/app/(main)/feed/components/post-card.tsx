
"use client"

import { useState, useEffect } from "react"
import { Post, User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { notifications, posts as allPosts } from "@/lib/data"
import { getLoggedInUser } from "@/lib/auth"
import Image from "next/image"


interface PostCardProps {
  post: Post
  author: User
}

// In a real app, this would be stored per-user in a database
const likedPosts = new Set<string>();

export default function PostCard({ post, author }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(likedPosts.has(post.id));
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
  }, []);

  const handleLike = () => {
    const postToUpdate = allPosts.find(p => p.id === post.id);
    if (!postToUpdate) return;

    if (isLiked) {
      postToUpdate.likes--;
      likedPosts.delete(post.id);
      setLikes(postToUpdate.likes);
    } else {
      postToUpdate.likes++;
      likedPosts.add(post.id);
      setLikes(postToUpdate.likes);
       if (currentUser && currentUser.id !== author.id) {
        // Prevent duplicate like notifications
        const notificationExists = notifications.some(n => n.type === 'like' && n.fromUserId === currentUser.id && n.postId === post.id);
        if (!notificationExists) {
            notifications.unshift({
                id: `notif-${Date.now()}`,
                type: 'like',
                fromUserId: currentUser.id,
                toUserId: author.id,
                postId: post.id,
                timestamp: new Date().toISOString(),
                read: false,
            });
        }
      }
    }
    setIsLiked(!isLiked);
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.id}`}>
            <Avatar>
              <AvatarImage src={author.avatarUrl} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${author.id}`} className="hover:underline">
              <p className="font-semibold">{author.name}</p>
            </Link>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2 space-y-4">
        {post.content && <p className="whitespace-pre-wrap">{post.content}</p>}
        {post.mediaUrl && (
          <div className="relative aspect-video rounded-md overflow-hidden border">
              {post.mediaType === 'image' ? (
                <Image src={post.mediaUrl} alt={post.content || 'Post image'} fill className="object-cover" />
              ) : (
                <video src={post.mediaUrl} controls className="w-full h-full" />
              )}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-2 flex justify-between items-center border-t">
        <div className="flex gap-1 text-muted-foreground text-sm">
            <span>{likes} Likes</span>
            &middot;
            <span>{post.comments} Comments</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleLike} className={cn(isLiked ? "text-primary hover:text-primary" : "")}>
            <ThumbsUp className={cn("mr-2 h-4 w-4", isLiked && "fill-current")} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comment
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
