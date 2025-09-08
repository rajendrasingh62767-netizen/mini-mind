
"use client"

import { useState, useEffect } from "react"
import { Post, User, Comment as CommentType } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Share2, Send, Loader2, Music } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getLoggedInUser } from "@/lib/auth"
import Image from "next/image"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot, updateDoc, increment, orderBy, serverTimestamp } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"
import { users } from "@/lib/data"

interface PostCardProps {
  post: Post
  author: User
}

export default function PostCard({ post, author }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);


  useEffect(() => {
    if (post.timestamp) {
        const date = post.timestamp.toDate ? post.timestamp.toDate() : new Date(post.timestamp);
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    }
    setCurrentUser(getLoggedInUser());
  }, [post.timestamp]);

  useEffect(() => {
    if (!post.id) return;
    const postRef = doc(db, "posts", post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
        const data = doc.data();
        if (data) {
            setLikes(data.likes);
            setCommentsCount(data.comments);
        }
    });
    return () => unsubscribe();
  }, [post.id]);

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

  useEffect(() => {
    if (showCommentBox) {
        setIsLoadingComments(true);
        const commentsRef = collection(db, "posts", post.id, "comments");
        const q = query(commentsRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments: CommentType[] = [];
            snapshot.forEach(doc => {
                fetchedComments.push({ id: doc.id, ...doc.data() } as CommentType);
            });
            setComments(fetchedComments);
            setIsLoadingComments(false);
        });
        return () => unsubscribe();
    }
  }, [showCommentBox, post.id]);


  const handleLike = async () => {
    if (!currentUser || !post.id) return;

    const postRef = doc(db, "posts", post.id);
    const likesRef = collection(db, "posts", post.id, "likes");

    try {
        if (isLiked && likeDocId) {
            await deleteDoc(doc(likesRef, likeDocId));
            await updateDoc(postRef, { likes: increment(-1) });
        } else {
            await addDoc(likesRef, { userId: currentUser.id, timestamp: serverTimestamp() });
            await updateDoc(postRef, { likes: increment(1) });

            if (currentUser.id !== author.id) {
                const notificationsRef = collection(db, "notifications");
                await addDoc(notificationsRef, {
                    type: 'like',
                    fromUserId: currentUser.id,
                    toUserId: author.id,
                    postId: post.id,
                    timestamp: serverTimestamp(),
                    read: false,
                });
            }
        }
    } catch (error) {
        console.error("Error liking post:", error);
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !post.id || !newComment.trim()) return;

    setIsCommenting(true);
    const commentsRef = collection(db, "posts", post.id, "comments");
    const postRef = doc(db, "posts", post.id);

    try {
        await addDoc(commentsRef, {
            authorId: currentUser.id,
            text: newComment,
            timestamp: serverTimestamp()
        });
        await updateDoc(postRef, { comments: increment(1) });

        if (currentUser.id !== author.id) {
           // TODO: Add comment notification in the future
        }
        
        setNewComment("");
    } catch (error) {
        console.error("Error adding comment:", error);
    } finally {
        setIsCommenting(false);
    }
  };
  
  const getCommentAuthor = (authorId: string) => {
      return users.find(u => u.id === authorId);
  }

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
        {post.song && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-md bg-muted/50 border">
                <Music className="h-4 w-4" />
                <span>{post.song}</span>
            </div>
        )}
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
        <div className="flex gap-2 text-muted-foreground text-sm">
            {likes > 0 && <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>}
            {likes > 0 && commentsCount > 0 && <span>&middot;</span>}
            {commentsCount > 0 && <button onClick={() => setShowCommentBox(!showCommentBox)} className="hover:underline">{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</button>}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleLike} className={cn(isLiked ? "text-primary hover:text-primary" : "")}>
            <ThumbsUp className={cn("mr-2 h-4 w-4", isLiked && "fill-current")} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowCommentBox(!showCommentBox)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Comment
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>
      {showCommentBox && (
          <div className="p-4 border-t">
             <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                 <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={currentUser?.avatarUrl} />
                    <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="w-full relative">
                    <Textarea 
                        placeholder="Write a comment..." 
                        rows={1}
                        className="pr-12 resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                     <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isCommenting || !newComment.trim()}>
                        {isCommenting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Post Comment</span>
                    </Button>
                </div>
             </form>
             <div className="mt-4 space-y-4">
                 {isLoadingComments ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                 ) : comments.length > 0 ? (
                    comments.map(comment => {
                        const commentAuthor = getCommentAuthor(comment.authorId);
                        if (!commentAuthor) return null;
                        return (
                             <div key={comment.id} className="flex items-start gap-3">
                                 <Avatar className="w-8 h-8">
                                    <AvatarImage src={commentAuthor.avatarUrl} />
                                    <AvatarFallback>{commentAuthor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="bg-muted p-3 rounded-lg w-full">
                                    <div className="flex items-center justify-between">
                                        <Link href={`/profile/${commentAuthor.id}`} className="font-semibold text-sm hover:underline">{commentAuthor.name}</Link>
                                         <p className="text-xs text-muted-foreground">
                                            {comment.timestamp?.toDate && formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <p className="text-sm mt-1">{comment.text}</p>
                                </div>
                             </div>
                        )
                    })
                 ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
                 )}
             </div>
          </div>
      )}
    </Card>
  )
}
