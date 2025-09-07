
"use client"
import { useState, useReducer } from "react"
import { useRouter } from "next/navigation"
import { getLoggedInUser } from "@/lib/auth"
import { posts as initialPosts } from "@/lib/data"
import { Post, User } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusSquare, Loader2, Image as ImageIcon, Video, ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function CreatePostPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [content, setContent] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  useState(() => {
    const user = getLoggedInUser();
    if (user) {
      setCurrentUser(user);
    } else {
      router.push('/login');
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (!content.trim() && !mediaFile)) return;
    
    setIsLoading(true);

    let mediaUrl: string | undefined = undefined;
    if (mediaFile) {
        // In a real app, you would upload this file to a cloud storage service like Firebase Storage
        // and get back a URL. For this example, we'll use the local object URL.
        mediaUrl = mediaPreview!;
    }
    
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      content: content,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      mediaUrl: mediaUrl,
      mediaType: mediaType || undefined,
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    initialPosts.unshift(newPost);
    
    setIsLoading(false);
    router.push(`/feed`);
  }

  if (!currentUser) {
    return <p>Loading...</p>
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Button variant="ghost" size="icon" onClick={() => router.push('/feed')} className="md:hidden">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
          </Button>
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <PlusSquare className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-headline">Create a new Post</CardTitle>
            <CardDescription>
              Share your thoughts, photos, or videos with your network.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <Label htmlFor="media-upload" className="block text-sm font-medium text-gray-700">
                    Upload Photo or Video
                </Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                    {mediaPreview ? (
                        <div>
                             {mediaType === 'image' && <Image src={mediaPreview} alt="Preview" width={400} height={400} className="mx-auto rounded-md object-contain max-h-80"/>}
                             {mediaType === 'video' && <video src={mediaPreview} controls className="mx-auto rounded-md max-h-80" />}
                             <Button variant="link" size="sm" onClick={() => {
                                 setMediaFile(null);
                                 setMediaPreview(null);
                                 setMediaType(null);
                                 const input = document.getElementById('media-upload') as HTMLInputElement;
                                 if(input) input.value = '';
                             }}>Remove</Button>
                        </div>
                    ) : (
                        <>
                            <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-around">
                                <ImageIcon className="h-8 w-8" />
                                <Video className="h-8 w-8" />
                            </div>
                            <div className="flex text-sm text-gray-600">
                                <Label htmlFor="media-upload" className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                                <span>Upload a file</span>
                                <Input id="media-upload" name="media-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" />
                                </Label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB; MP4, MOV up to 100MB</p>
                        </>
                    )}
                    </div>
                </div>
            </div>

            <div>
                <Label htmlFor="content">Caption</Label>
                <Textarea
                    id="content"
                    placeholder="Write a caption..."
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading || (!content.trim() && !mediaFile)}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {isLoading ? "Posting..." : "Post"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
