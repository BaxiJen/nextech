import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        source: "blog",
      },
      { onConflict: "email" }
    );

    if (error) {
      if (error.code === "23505") {
        // Unique violation — already subscribed
        return NextResponse.json({
          message: "Email já inscrito",
          already_subscribed: true,
        });
      }
      console.error("Newsletter signup error:", error);
      return NextResponse.json({ error: "Erro ao inscrever" }, { status: 500 });
    }

    // TODO: Send confirmation email via Resend/SendGrid when configured

    return NextResponse.json({
      message: "Inscrito com sucesso",
      success: true,
    });
  } catch (err) {
    console.error("Newsletter API error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Confirm subscription via token
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/blog?confirmed=missing", req.url));
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq("confirm_token", token);

  if (error) {
    return NextResponse.redirect(new URL("/blog?confirmed=error", req.url));
  }

  return NextResponse.redirect(new URL("/blog?confirmed=true", req.url));
}