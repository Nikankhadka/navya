// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId : null;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const weekStart = getWeekStart().toISOString();

    // Fetch this week's completed workouts
    const { data: sessions } = await supabase
      .from("workout_sessions")
      .select("day_name, completed_at, duration_seconds")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("completed_at", weekStart)
      .order("completed_at", { ascending: false });

    // Fetch this week's food logs
    const { data: foodLogs } = await supabase
      .from("food_logs")
      .select("calories, protein_g, logged_at")
      .eq("user_id", userId)
      .gte("logged_at", weekStart);

    // Fetch latest weight
    const { data: weightLogs } = await supabase
      .from("weight_logs")
      .select("weight_kg, logged_at")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(2);

    // Fetch user profile for target
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("workouts_per_week, goal, weight_kg")
      .eq("id", userId)
      .maybeSingle();

    const completedThisWeek = sessions?.length ?? 0;
    const plannedPerWeek = profile?.workouts_per_week ?? 3;
    const avgDuration = sessions?.length
      ? Math.round(
          (sessions as { duration_seconds?: number }[]).reduce(
            (sum, s) => sum + (s.duration_seconds ?? 0),
            0,
          ) / sessions.length / 60,
        )
      : 0;

    const totalCalories = (foodLogs ?? []).reduce(
      (sum, f: { calories?: number }) => sum + (f.calories ?? 0),
      0,
    );
    const avgDailyCals = foodLogs?.length
      ? Math.round(totalCalories / 7)
      : 0;

    const currentWeight = weightLogs?.[0]?.weight_kg ?? profile?.weight_kg;
    const prevWeight = weightLogs?.[1]?.weight_kg;
    const weightChange =
      currentWeight != null && prevWeight != null
        ? (currentWeight - prevWeight).toFixed(1)
        : null;

    const adherencePct =
      plannedPerWeek > 0
        ? Math.min(Math.round((completedThisWeek / plannedPerWeek) * 100), 100)
        : 0;

    let summary = `You completed ${completedThisWeek} of ${plannedPerWeek} planned workouts this week`;
    if (avgDuration > 0) summary += `, averaging ${avgDuration} min per session`;
    summary += `. `;

    if (adherencePct >= 80) {
      summary += "Solid consistency — you're hitting your targets. ";
    } else if (adherencePct >= 50) {
      summary += "You're building momentum. Try to add one more session next week. ";
    } else {
      summary += "Getting started is the hardest part. Aim for 2 sessions next week. ";
    }

    if (avgDailyCals > 0) {
      summary += `Your average daily intake was ~${avgDailyCals} kcal. `;
    }

    if (weightChange) {
      const direction = parseFloat(weightChange) < 0 ? "down" : "up";
      summary += `Weight trend: ${weightChange} kg ${direction} from last check-in. `;
    }

    summary +=
      "Keep logging your meals and workouts for even better insights next week.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_error) {
    return new Response(
      JSON.stringify({
        summary:
          "Weekly summary is not available right now. Your coach will have insights once you log data consistently.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
