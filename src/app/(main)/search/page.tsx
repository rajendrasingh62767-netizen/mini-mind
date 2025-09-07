
"use client"

import SearchUsers from "./components/search-users";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Search className="w-6 h-6" />
            </div>
            <div>
                <CardTitle className="text-2xl font-bold font-headline">Search Users</CardTitle>
                <CardDescription>
                Find and connect with other users on the platform.
                </CardDescription>
            </div>
        </CardHeader>
      </Card>
      <SearchUsers />
    </div>
  );
}
