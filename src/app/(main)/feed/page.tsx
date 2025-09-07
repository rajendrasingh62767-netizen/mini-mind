"use client";

import { useState, useEffect } from "react";
import { posts as initialPosts, users, getCurrentUser } from "@/lib/data";
import CreatePostForm from "./components/create-post-form";
import PostCard from "./components/post-card";
import { Post, User } from "@/lib/types";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);


  const handleNewPost = (content: string) => {
    if (!currentUser) return;

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

  if (!currentUser) {
    return <div>Loading feed...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Home Feed</h1>
      <CreatePostForm onNewPost={handleNewPost} currentUser={currentUser} />
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
