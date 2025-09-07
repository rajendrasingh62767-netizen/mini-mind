
"use client";

import { useState, useEffect } from "react";
import { users } from "@/lib/data";
import { getLoggedInUser } from "@/lib/auth";
import CreatePostForm from "./components/create-post-form";
import PostCard from "./components/post-card";
import { Post, User } from "@/lib/types";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(postsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!currentUser) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Home Feed</h1>
      <CreatePostForm currentUser={currentUser} />
      <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            posts.map((post) => {
            const author = users.find((user) => user.id === post.authorId);
            if (!author) return null;
            return <PostCard key={post.id} post={post} author={author} />;
            })
        )}
      </div>
    </div>
  );
}
