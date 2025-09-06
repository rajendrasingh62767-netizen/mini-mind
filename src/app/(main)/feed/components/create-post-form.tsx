"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { currentUser } from "@/lib/data"

interface CreatePostFormProps {
  onNewPost: (content: string) => void;
}

export default function CreatePostForm({ onNewPost }: CreatePostFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onNewPost(content);
      setContent("");
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
                <Button type="submit" disabled={!content.trim()}>Post</Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
