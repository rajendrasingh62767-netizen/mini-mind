"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { currentUser, users, posts } from "@/lib/data"
import PostCard from "../../feed/components/post-card"
import { Pencil } from "lucide-react"
import { notFound } from "next/navigation"

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const user = users.find((u) => u.id === params.userId)

  if (!user) {
    notFound();
  }

  const userPosts = posts.filter((post) => post.authorId === user.id)
  const isCurrentUser = user.id === currentUser.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-card">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                {isCurrentUser && (
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Profile</span>
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground">{user.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight font-headline">{isCurrentUser ? "Your" : `${user.name.split(' ')[0]}'s`} Posts</h2>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard key={post.id} post={post} author={user} />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {isCurrentUser ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
