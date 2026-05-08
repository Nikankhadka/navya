// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (request) => {
  try {
    const body = await request.json();
    const text =
      typeof body?.text === "string" && body.text.trim().length > 0
        ? body.text.trim()
        : "Coach request";

    return new Response(
      JSON.stringify({
        id: crypto.randomUUID(),
        user_id: "server-generated",
        action_type: "quick_reply",
        role: "coach",
        text: `Coach fallback: ${text}. Wire this function to OpenAI only after secrets, usage limits, and validation are in place.`,
        created_at: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (_error) {
    return new Response(
      JSON.stringify({
        error: "Unable to process coach request.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
