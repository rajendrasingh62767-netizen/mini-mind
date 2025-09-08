'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createReel } from './actions';
import { Loader2, Sparkles, AlertCircle, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ReelGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const result = await createReel({ prompt });
      if (result.success && result.data) {
        setGeneratedVideo(result.data.videoDataUri);
      } else {
        setError(result.error || 'An unknown error occurred while generating the video.');
      }
    } catch (err) {
      setError('Failed to process your request. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-headline">AI Reel Generator</CardTitle>
            <CardDescription>
              Describe your idea, and let AI create a short video reel for you.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Reel Prompt</Label>
              <Input
                id="prompt"
                placeholder="e.g., A majestic dragon soaring over a mystical forest at dawn."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Reel... (this may take a minute)
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedVideo && (
        <Card>
          <CardHeader>
            <CardTitle>Your Generated Reel</CardTitle>
          </CardHeader>
          <CardContent>
            <video src={generatedVideo} controls autoPlay muted loop className="w-full rounded-md aspect-[9/16] bg-black" />
             <Button onClick={() => {
                const a = document.createElement('a');
                a.href = generatedVideo;
                a.download = 'generated_reel.mp4';
                a.click();
            }} className="mt-4">Download Video</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
