"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { analyzeProfile } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User } from '@/lib/types'
import { ProfileImprovementOutput } from '@/ai/flows/profile-improvement-suggestions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, Lightbulb, User as UserIcon, FileText } from 'lucide-react'

const formSchema = z.object({
  profilePhoto: z.any().refine(fileList => fileList.length === 1, 'Profile photo is required.'),
  profileDescription: z.string().min(50, 'Description must be at least 50 characters.'),
  desiredAudience: z.string().min(5, 'Desired audience is required.'),
  industry: z.string().min(3, 'Industry is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AnalyzerFormProps {
    currentUser: User;
}

export default function AnalyzerForm({ currentUser }: AnalyzerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ProfileImprovementOutput | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileDescription: currentUser.description,
      desiredAudience: '',
      industry: 'Software Engineering',
    },
  });

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const photoFile = values.profilePhoto[0] as File;
      const photoDataUri = await fileToDataUri(photoFile);

      const result = await analyzeProfile({
        profilePhotoDataUri: photoDataUri,
        profileDescription: values.profileDescription,
        desiredAudience: values.desiredAudience,
        industry: values.industry,
      });

      if (result.success) {
        setSuggestions(result.data!);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    } catch (e) {
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Fill out the details below to get personalized feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Profile Photo</Label>
              <Input id="profilePhoto" type="file" accept="image/*" {...form.register('profilePhoto')} />
              {form.formState.errors.profilePhoto && <p className="text-sm text-destructive">{form.formState.errors.profilePhoto.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileDescription">Profile Description</Label>
              <Textarea
                id="profileDescription"
                rows={5}
                {...form.register('profileDescription')}
              />
              {form.formState.errors.profileDescription && <p className="text-sm text-destructive">{form.formState.errors.profileDescription.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desiredAudience">Desired Audience</Label>
                <Input id="desiredAudience" placeholder="e.g., Tech Recruiters, Startup Founders" {...form.register('desiredAudience')} />
                 {form.formState.errors.desiredAudience && <p className="text-sm text-destructive">{form.formState.errors.desiredAudience.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g., Technology, Marketing" {...form.register('industry')} />
                {form.formState.errors.industry && <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>}
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Analyzing...' : 'Get Suggestions'}
            </Button>
          </CardContent>
        </Card>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && (
        <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-bold font-headline">Your Suggestions</h2>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserIcon /> Photo Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{suggestions.photoSuggestions}</p>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Description Suggestions</CardTitle>
            </Header>
            <CardContent>
               <p className="text-muted-foreground">{suggestions.descriptionSuggestions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb /> Overall Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground">{suggestions.overallSuggestions}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
