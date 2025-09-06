"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { currentUser } from "@/lib/data"

export default function CreatePostForm() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={currentUser.avatarUrl} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-2">
            <form>
              <Textarea
                placeholder="What's on your mind?"
                className="w-full border-none focus-visible:ring-0 resize-none text-lg"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button>Post</Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
