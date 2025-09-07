
"use client"

import SearchUsers from "./components/search-users";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Search className="w-6 h-6" />
                  </div>
                  <div>
                      <CardTitle className="text-2xl font-bold font-headline">Search Users</CardTitle>
                      <CardDescription>
                      Find and connect with other users on the platform.
                      </CardDescription>
                  </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
          </div>
        </CardHeader>
      </Card>
      <SearchUsers />
    </div>
  );
}
