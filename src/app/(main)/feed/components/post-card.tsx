import { Post, User } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

interface PostCardProps {
  post: Post
  author: User
}

export default function PostCard({ post, author }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={author.avatarUrl} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{author.name}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="px-4 py-2 flex justify-between items-center border-t">
        <div className="flex gap-1 text-muted-foreground text-sm">
            <span>{post.likes} Likes</span>
            &middot;
            <span>{post.comments} Comments</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Like
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
