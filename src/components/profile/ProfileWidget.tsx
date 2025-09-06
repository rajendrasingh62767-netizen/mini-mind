"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { User, X } from "lucide-react"
import { currentUser, users, posts } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PostCard from "@/app/(main)/feed/components/post-card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ProfileWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const user = currentUser;
  const userPosts = posts.filter((post) => post.authorId === user.id)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="w-16 h-16 rounded-full shadow-lg"
          size="icon"
          aria-label="Profile"
        >
          {isOpen ? <X className="h-8 w-8" /> : <User className="h-8 w-8" />}
          <span className="sr-only">Toggle Profile</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[400px] h-[600px] p-0 rounded-lg overflow-hidden flex flex-col"
        sideOffset={20}
      >
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
             <Card>
                <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="w-24 h-24 border-4 border-card">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-headline">{user.name}</h1>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                    <p className="text-muted-foreground pt-2">{user.description}</p>
                    </div>
                </div>
                </CardContent>
            </Card>

            <h2 className="text-lg font-bold tracking-tight font-headline">Your Posts</h2>
             {userPosts.length > 0 ? (
                userPosts.map((post) => (
                    <PostCard key={post.id} post={post} author={user} />
                ))
                ) : (
                <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                    You haven't posted anything yet.
                    </CardContent>
                </Card>
                )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
