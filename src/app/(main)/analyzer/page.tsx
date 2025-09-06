import AnalyzerForm from "./components/analyzer-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AnalyzerPage() {
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
      <AnalyzerForm />
    </div>
  )
}
