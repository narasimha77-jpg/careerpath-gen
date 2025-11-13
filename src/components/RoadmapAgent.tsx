import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RoadmapStep from "./RoadmapStep";
import ColorPalette from "./ColorPalette";

interface Resource {
  type: "course" | "book" | "video" | "tool";
  title: string;
  url?: string;
}

interface Step {
  id: number;
  title: string;
  summary: string;
  duration: string;
  milestones: string[];
  resources: Resource[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color_suggest: string;
}

interface Roadmap {
  title: string;
  overview: string;
  accent_palette: string[];
  steps: Step[];
  pretty_markdown: string;
}

const RoadmapAgent = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const { toast } = useToast();

  const generateRoadmap = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate a roadmap.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setRoadmap(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-roadmap", {
        body: { topic: topic.trim() },
      });

      if (error) {
        console.error("Edge function error:", error);
        
        if (error.message?.includes("429") || error.message?.includes("rate limit")) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes("402") || error.message?.includes("credits")) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your Lovable AI workspace.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation Failed",
            description: error.message || "Failed to generate roadmap. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.roadmap) {
        setRoadmap(data.roadmap);
        toast({
          title: "Roadmap Generated!",
          description: `Successfully created a learning path for ${topic}`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Roadmap generation error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Placement Roadmap Agent
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter any topic and get a personalized, structured learning path powered by AI
          </p>
        </div>

        {/* Input Section */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-elegant animate-scale-in">
          <CardHeader>
            <CardTitle>Generate Your Learning Roadmap</CardTitle>
            <CardDescription>
              Enter a topic like "AIML", "Web Development", "Cybersecurity", or "Blockchain"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="e.g., Machine Learning"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && generateRoadmap()}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={generateRoadmap}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Display */}
        {roadmap && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Overview Section */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-3xl">{roadmap.title}</CardTitle>
                <CardDescription className="text-base">{roadmap.overview}</CardDescription>
              </CardHeader>
              <CardContent>
                <ColorPalette colors={roadmap.accent_palette} />
              </CardContent>
            </Card>

            {/* Steps Timeline */}
            <div className="space-y-6">
              {roadmap.steps.map((step, index) => (
                <RoadmapStep
                  key={step.id}
                  step={step}
                  index={index}
                  totalSteps={roadmap.steps.length}
                />
              ))}
            </div>

            {/* Markdown Summary */}
            {roadmap.pretty_markdown && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Complete Roadmap Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
                      {roadmap.pretty_markdown}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapAgent;
