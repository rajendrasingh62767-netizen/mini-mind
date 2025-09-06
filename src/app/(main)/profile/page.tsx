import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { currentUser, posts } from "@/lib/data"
import PostCard from "../feed/components/post-card"
import { Pencil } from "lucide-react"

export default function ProfilePage() {
  const userPosts = posts.filter((post) => post.authorId === currentUser.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-card">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="text-4xl">{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold font-headline">{currentUser.name}</h1>
                <Button variant="outline" size="icon">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit Profile</span>
                </Button>
              </div>
              <p className="text-muted-foreground">{currentUser.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Your Posts</h2>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard key={post.id} post={post} author={currentUser} />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              You haven&apos;t posted anything yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
