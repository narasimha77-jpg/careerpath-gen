import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Clock, Calendar, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RoadmapStep from "./RoadmapStep";
import ColorPalette from "./ColorPalette";
import { Badge } from "@/components/ui/badge";

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
  icon: string;
  milestones: string[];
  resources: Resource[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color_suggest: string;
}

interface WeeklyPlan {
  week: number;
  tasks: string[];
}

interface Project {
  name: string;
  description: string;
  repo_template: {
    folders: string[];
    readme_snippet: string;
  };
  starter_task: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface InterviewQuestion {
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  short_answer_tip: string;
}

interface Roadmap {
  title: string;
  overview: string;
  accent_palette: string[];
  weekly_hours: number;
  total_weeks_estimate: number;
  estimated_weekly_tasks: number;
  steps: Step[];
  weekly_plan: WeeklyPlan[];
  projects: Project[];
  interview_questions: InterviewQuestion[];
  pretty_markdown: string;
  validation_hint: {
    valid_schema: boolean;
    errors: string[];
  };
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
              <CardContent className="space-y-6">
                <ColorPalette colors={roadmap.accent_palette} />
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Hours</p>
                      <p className="text-xl font-bold">{roadmap.weekly_hours}h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Duration</p>
                      <p className="text-xl font-bold">{roadmap.total_weeks_estimate} weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Tasks</p>
                      <p className="text-xl font-bold">{roadmap.estimated_weekly_tasks}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps Timeline */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Learning Path</h2>
              {roadmap.steps.map((step, index) => (
                <RoadmapStep
                  key={step.id}
                  step={step}
                  index={index}
                  totalSteps={roadmap.steps.length}
                />
              ))}
            </div>

            {/* Weekly Plan */}
            {roadmap.weekly_plan && roadmap.weekly_plan.length > 0 && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Week-by-Week Plan</CardTitle>
                  <CardDescription>Structured weekly tasks to keep you on track</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roadmap.weekly_plan.slice(0, 12).map((week) => (
                      <div key={week.week} className="border-l-2 border-primary pl-4">
                        <h4 className="font-semibold mb-2">Week {week.week}</h4>
                        <ul className="space-y-1">
                          {week.tasks.map((task, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {roadmap.weekly_plan.length > 12 && (
                      <p className="text-sm text-muted-foreground italic">
                        + {roadmap.weekly_plan.length - 12} more weeks...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {roadmap.projects && roadmap.projects.length > 0 && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Hands-On Projects</CardTitle>
                  <CardDescription>Build your portfolio with these projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {roadmap.projects.map((project, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{project.name}</h4>
                          <Badge variant="outline">{project.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                        <div className="text-xs space-y-2">
                          <div>
                            <span className="font-medium">Starter Task:</span>{" "}
                            <span className="text-muted-foreground">{project.starter_task}</span>
                          </div>
                          {project.repo_template?.folders && (
                            <div>
                              <span className="font-medium">Structure:</span>{" "}
                              <span className="text-muted-foreground">
                                {project.repo_template.folders.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Questions */}
            {roadmap.interview_questions && roadmap.interview_questions.length > 0 && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Interview Preparation</CardTitle>
                  <CardDescription>Common questions you should be ready for</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roadmap.interview_questions.map((q, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium flex-1">{q.question}</h4>
                          <Badge 
                            variant="outline"
                            className={
                              q.difficulty === "Easy" 
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : q.difficulty === "Medium"
                                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                            }
                          >
                            {q.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Tip:</span> {q.short_answer_tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
