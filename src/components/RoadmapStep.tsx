import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, Wrench, ExternalLink, CheckCircle2 } from "lucide-react";

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

interface RoadmapStepProps {
  step: Step;
  index: number;
  totalSteps: number;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case "course":
      return <BookOpen className="w-4 h-4" />;
    case "video":
      return <Video className="w-4 h-4" />;
    case "tool":
      return <Wrench className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "Intermediate":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "Advanced":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-primary/10 text-primary";
  }
};

const RoadmapStep = ({ step, index, totalSteps }: RoadmapStepProps) => {
  return (
    <div className="relative">
      {/* Timeline connector */}
      {index < totalSteps - 1 && (
        <div className="absolute left-8 top-24 w-0.5 h-full bg-gradient-to-b from-primary/50 to-transparent -z-10" />
      )}

      <Card className="shadow-elegant hover-scale transition-all duration-300">
        <CardHeader className="flex flex-row items-start gap-4">
          {/* Step Number Badge */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow shrink-0"
            style={{ backgroundColor: step.color_suggest || "hsl(var(--primary))" }}
          >
            {step.id}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(step.difficulty)}>
                {step.difficulty}
              </Badge>
              <Badge variant="outline">{step.duration}</Badge>
            </div>
            <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
            <p className="text-muted-foreground">{step.summary}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Milestones */}
          {step.milestones.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Key Milestones
              </h4>
              <ul className="space-y-2">
                {step.milestones.map((milestone, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {step.resources.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Learning Resources</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {step.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url || "#"}
                    target={resource.url ? "_blank" : undefined}
                    rel={resource.url ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors ${
                      !resource.url ? "pointer-events-none" : ""
                    }`}
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{resource.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                    </div>
                    {resource.url && <ExternalLink className="w-4 h-4 text-muted-foreground" />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoadmapStep;
