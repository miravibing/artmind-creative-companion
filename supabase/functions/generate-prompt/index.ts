import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { categories, difficulty, mode, seed } = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // mode: "structured" (new) or "simple" (legacy/dashboard)
    const isStructured = mode === "structured" && categories?.length > 0;

    // Diverse theme pools for anti-repetition
    const artThemes = [
      "nostalgia", "chaos vs order", "hidden worlds", "transformation", "solitude",
      "celebration", "decay and beauty", "movement and stillness", "forbidden places",
      "childhood memories", "future ruins", "underwater kingdoms", "celestial bodies",
      "urban wildlife", "forgotten machines", "emotional landscapes", "mythical encounters",
      "seasons changing", "light through glass", "shadows and secrets", "growing things",
      "storms and calm", "ancient and modern", "textures of time", "impossible gardens",
      "dream architecture", "musical colors", "taste of places", "voices in silence",
      "bridges between worlds", "floating islands", "crystalline structures", "bioluminescence",
    ];
    const artStyles = [
      "watercolor", "ink wash", "charcoal", "gouache", "oil paint", "digital painting",
      "pointillism", "cross-hatching", "flat color", "impasto", "collage", "mixed media",
      "line art", "stippling", "monochrome", "palette knife", "spray paint", "pencil sketch",
    ];
    const artSubjects = [
      "portraits", "landscapes", "still life", "animals", "architecture", "abstract forms",
      "botanical", "figure studies", "cityscapes", "seascapes", "interiors", "food",
      "hands and gestures", "eyes and faces", "fabric and drapery", "reflections",
    ];

    // Pick random elements for variety
    const randTheme = artThemes[Math.floor(Math.random() * artThemes.length)];
    const randStyle = artStyles[Math.floor(Math.random() * artStyles.length)];
    const randSubject = artSubjects[Math.floor(Math.random() * artSubjects.length)];
    const todayStr = new Date().toISOString().slice(0, 10);

    let systemPrompt: string;
    let userPrompt: string;

    if (isStructured) {
      const difficultyLevel = difficulty || "Intermediate";
      const categoryList = (categories as string[]).join(", ");

      systemPrompt = `You are an expert art instructor generating structured practice prompts for artists.
Rules:
- Be specific and actionable — no vague tasks.
- Scale complexity with difficulty level.
- Focus on skill-building fundamentals.
- Keep each prompt to 1-2 sentences max.
- Make prompts UNIQUE and VARIED — never generic or repetitive.
- Today's inspiration theme: "${randTheme}" — weave this into the prompts naturally.

Return ONLY a JSON object with this exact structure:
{
  "category": "the primary category name",
  "difficulty": "${difficultyLevel}",
  "warmup": "a quick warm-up exercise (2-5 minutes)",
  "study": "a focused study exercise (15-30 minutes)",
  "challenge": "a creative challenge that applies the skill (30-60 minutes)"
}
No other text.`;

      userPrompt = `Generate art practice prompts for: ${categoryList}.
Difficulty: ${difficultyLevel}. Theme seed: "${randTheme}" + "${randSubject}".
${categories.length > 1 ? "Pick one primary category and blend elements from the others." : ""}
Make these prompts fresh and distinct — avoid generic exercises.`;
    } else {
      // Dashboard simple mode with high variety
      systemPrompt = `You are a creative muse for visual artists. Generate a single, evocative, imaginative creative prompt that inspires drawing, painting, or illustration. The prompt should be one sentence, poetic and open-ended.

CRITICAL RULES FOR VARIETY:
- Each prompt must be completely unique and surprising.
- Avoid cliché art prompts like "draw your emotions" or "sketch a dream."
- Blend unexpected concepts together.
- Vary between abstract, narrative, technical, and experimental prompts.
- Today's random seed theme: "${randTheme}" — use this as loose inspiration.
- Suggested medium/style hint: "${randStyle}" — optionally reference this.
- Subject area: "${randSubject}" — weave elements of this in.

Return ONLY a JSON object with two fields: 'text' (the prompt) and 'category' (a short 1-2 word label like 'Abstract', 'Portrait', 'Character Design', 'Environment', 'Conceptual', 'Surreal', 'Symbolic', 'Creature Design'). No other text.`;
      userPrompt = `Generate a unique creative art prompt. Date: ${todayStr}. Seed: ${seed || Math.random().toString(36).slice(2, 8)}. Theme: ${randTheme}. Be inventive and avoid repeating common prompts.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits required. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Parse JSON from AI response
    let parsed: Record<string, string>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      if (isStructured) {
        parsed = {
          category: (categories as string[])[0] || "General",
          difficulty: difficulty || "Intermediate",
          warmup: "Draw 10 quick gesture sketches of everyday objects around you.",
          study: "Create a detailed study focusing on light and shadow using a single light source.",
          challenge: "Design an original composition combining multiple elements from your studies.",
        };
      } else {
        parsed = { text: content, category: "Creative" };
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-prompt error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
