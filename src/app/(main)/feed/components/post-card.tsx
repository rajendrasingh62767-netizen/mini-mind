
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
import { getLoggedInUser } from "@/lib/auth"
import Image from "next/image"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot, updateDoc, increment } from "firebase/firestore"

interface PostCardProps {
  post: Post
  author: User
}


export default function PostCard({ post, author }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    if (post.timestamp) {
        const date = post.timestamp.toDate ? post.timestamp.toDate() : new Date(post.timestamp);
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    }
    setCurrentUser(getLoggedInUser());
  }, [post.timestamp]);


  useEffect(() => {
    if (!post.id || !currentUser?.id) return;
    const likesRef = collection(db, "posts", post.id, "likes");
    const q = query(likesRef, where("userId", "==", currentUser.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            setIsLiked(true);
            setLikeDocId(snapshot.docs[0].id);
        } else {
            setIsLiked(false);
            setLikeDocId(null);
        }
    });

    return () => unsubscribe();
  }, [post.id, currentUser?.id]);


  const handleLike = async () => {
    if (!currentUser || !post.id) return;

    const postRef = doc(db, "posts", post.id);
    const likesRef = collection(db, "posts", post.id, "likes");

    if (isLiked && likeDocId) {
        // Unlike
        await deleteDoc(doc(likesRef, likeDocId));
        await updateDoc(postRef, { likes: increment(-1) });
        setLikes(prev => prev - 1);
    } else {
        // Like
        await addDoc(likesRef, { userId: currentUser.id });
        await updateDoc(postRef, { likes: increment(1) });
        setLikes(prev => prev + 1);

       if (currentUser.id !== author.id) {
          const notificationsRef = collection(db, "notifications");
          const q = query(notificationsRef, 
            where('type', '==', 'like'),
            where('fromUserId', '==', currentUser.id),
            where('postId', '==', post.id)
          );
          const existingNotifs = await getDocs(q);

          if (existingNotifs.empty) {
             await addDoc(notificationsRef, {
                id: `notif-${Date.now()}`,
                type: 'like',
                fromUserId: currentUser.id,
                toUserId: author.id,
                postId: post.id,
                timestamp: new Date(),
                read: false,
            });
          }
      }
    }
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
