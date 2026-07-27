import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      full_name,
      email,
      password,
      role,
      company_id,
      is_active,
    } = body;

    // Create Auth User
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error(authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create User Profile
    const { error: profileError } =
      await supabaseAdmin
        .from("user_profiles")
        .insert({
          id: authUser.user.id,
          full_name,
          email,
          role,
          company_id,
          is_active,
        });

    if (profileError) {
      console.error(profileError);

      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}