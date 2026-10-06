import { NextResponse } from "next/server"; import { getSupabaseUser } from "@/lib/supabase/user";
export async function POST(request:Request){const supabase=await getSupabaseUser();if(supabase)await supabase.auth.signOut();return NextResponse.redirect(new URL("/",request.url));}
