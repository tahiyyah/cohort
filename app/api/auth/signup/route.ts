import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json(
      { error: "email, password and name are required" },
      { status: 400 }
    );
  }

  const { email, password, name, programme, cohort, location } = body;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, programme, cohort, location },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { user: data.user, session: data.session },
    { status: 201 }
  );
}
