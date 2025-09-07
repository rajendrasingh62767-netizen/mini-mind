
"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/lib/types";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CreatePostFormProps {
  onNewPost?: (content: string) => void;
  currentUser: User;
}

export default function CreatePostForm({ onNewPost, currentUser }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;
    
    setIsLoading(true);

    try {
      await addDoc(collection(db, "posts"), {
        authorId: currentUser.id,
        content: content,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: 0,
      });
      setContent("");
      onNewPost?.(content); // Optional callback
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={currentUser.avatarUrl} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-2">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="What's on your mind?"
                className="w-full border-none focus-visible:ring-0 resize-none text-lg"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!content.trim() || isLoading}>
                  {isLoading ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
