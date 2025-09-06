import { posts, users } from "@/lib/data"
import CreatePostForm from "./components/create-post-form"
import PostCard from "./components/post-card"

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Home Feed</h1>
      <CreatePostForm />
      <div className="space-y-4">
        {posts.map((post) => {
          const author = users.find((user) => user.id === post.authorId);
          if (!author) return null;
          return <PostCard key={post.id} post={post} author={author} />
        })}
      </div>
    </div>
  )
}
