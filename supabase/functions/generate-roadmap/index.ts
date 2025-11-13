import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Create a polished learning roadmap for ${topic}.
Return ONLY valid JSON with this exact structure:
{
  "title": string,
  "overview": string,
  "accent_palette": [3 hex colors],
  "weekly_hours": integer (student's available study hours per week, estimate 10-15),
  "total_weeks_estimate": integer (sum of all weeks needed),
  "estimated_weekly_tasks": integer (how many short tasks per week, typically 3-5),
  "steps": [
      {
        "id": number,
        "title": string,
        "summary": string,
        "duration": string,
        "icon": string (lucide-react icon name like "book-open", "code", "database", "brain", etc),
        "milestones": [strings],
        "resources": [
          {"type":"course"|"book"|"video"|"tool", "title": string, "url": string or null}
        ],
        "difficulty": "Beginner"|"Intermediate"|"Advanced",
        "color_suggest": hex-color
      }
  ],
  "weekly_plan": [
    {"week": number, "tasks": [actionable one-line task strings]}
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "repo_template": {
        "folders": [folder name strings],
        "readme_snippet": string
      },
      "starter_task": string,
      "difficulty": "Beginner"|"Intermediate"|"Advanced"
    }
  ],
  "interview_questions": [
    {
      "question": string,
      "difficulty": "Easy"|"Medium"|"Hard",
      "short_answer_tip": string
    }
  ],
  "pretty_markdown": string,
  "validation_hint": {
    "valid_schema": boolean,
    "errors": [strings]
  }
}

Make it comprehensive, professional, and tailored for college placement preparation. Include 5-8 steps, 3-5 projects, and 10-15 interview questions. Make weekly_plan actionable and divide work based on weekly_hours. Make sure it is always valid JSON with no markdown formatting. Use low randomness for deterministic structure.`;

    console.log("Calling Lovable AI for topic:", topic);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator. Generate structured learning roadmaps in valid JSON format only.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits required. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up markdown code blocks if present
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.slice(7);
    } else if (content.startsWith("```")) {
      content = content.slice(3);
    }
    if (content.endsWith("```")) {
      content = content.slice(0, -3);
    }
    content = content.trim();

    // Parse the JSON response
    let roadmap;
    try {
      roadmap = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate basic structure
    if (!roadmap.title || !roadmap.steps || !Array.isArray(roadmap.steps)) {
      console.error("Invalid roadmap structure:", roadmap);
      return new Response(
        JSON.stringify({ error: "Invalid roadmap format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully generated roadmap for:", topic);

    return new Response(
      JSON.stringify({ roadmap }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-roadmap:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
