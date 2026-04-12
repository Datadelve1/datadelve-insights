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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { questions, studentAnswers, modelAnswers, keyConcepts } = await req.json();

    if (!questions || !studentAnswers || !modelAnswers) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const evaluations = [];

    for (let i = 0; i < questions.length; i++) {
      const prompt = `You are an expert SQL instructor.

Your task is to evaluate a student's answer.

Inputs:
- Question: ${questions[i]}
- Model Answer: ${modelAnswers[i]}
- Student Answer: ${studentAnswers[i]}
- Key Concepts: ${keyConcepts[i] || "N/A"}

Instructions:
- Evaluate the student's answer based on meaning, not exact wording.
- Accept variations in phrasing if the core concept is correct.
- Classify the answer as: Correct, Partially Correct, or Incorrect
- Give a score out of 5:
  - 5 = fully correct
  - 3-4 = partially correct
  - 0-2 = incorrect
- Clearly explain what the student missed or got wrong.
- Provide a simple corrected answer.

Output ONLY valid JSON in this exact format:
{"result": "", "score": 0, "feedback": "", "correct_answer": ""}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a strict but fair SQL instructor. Return only valid JSON, no markdown." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`AI error for Q${i + 1}:`, response.status, errText);
        evaluations.push({
          result: "Error",
          score: 0,
          feedback: "Could not evaluate this answer. Please try again.",
          correct_answer: modelAnswers[i],
        });
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      try {
        // Strip markdown code fences if present
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        evaluations.push(parsed);
      } catch {
        console.error(`Failed to parse AI response for Q${i + 1}:`, content);
        evaluations.push({
          result: "Error",
          score: 0,
          feedback: "Could not parse evaluation. Please try again.",
          correct_answer: modelAnswers[i],
        });
      }
    }

    return new Response(JSON.stringify({ evaluations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-assignment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
