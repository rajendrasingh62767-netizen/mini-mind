"use client"

import AnalyzerForm from "./components/analyzer-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { getLoggedInUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function AnalyzerPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-headline">AI Profile Analyzer</CardTitle>
            <CardDescription>
              Get AI-powered suggestions to improve your profile and attract more connections.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      <AnalyzerForm currentUser={currentUser} />
    </div>
  )
}
