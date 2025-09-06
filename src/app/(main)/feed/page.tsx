"use client";

import { useState } from "react";
import { posts as initialPosts, users, currentUser } from "@/lib/data";
import CreatePostForm from "./components/create-post-form";
import PostCard from "./components/post-card";
import { Post } from "@/lib/types";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleNewPost = (content: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Home Feed</h1>
      <CreatePostForm onNewPost={handleNewPost} />
      <div className="space-y-4">
        {posts.map((post) => {
          const author = users.find((user) => user.id === post.authorId);
          if (!author) return null;
          return <PostCard key={post.id} post={post} author={author} />;
        })}
      </div>
    </div>
  );
}
