import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = ['"https://tizfox.github.io', "http://localhost:4200"];

Deno.serve(async (req) => {
	// Check the Origin of the Request
	const origin = req.headers.get("Origin") ?? "";
	const corsHeaders = {
		"Access-Control-Allow-Origin": allowedOrigins.includes(origin)
			? origin
			: allowedOrigins[0],
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
	};

	// If "OPTIONS" send our CORS
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	// Create Supabase Admin
	const supabaseAdmin = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
	);

	// Create Supabase Client
	const authHeader = req.headers.get("Authorization");
	const supabaseClient = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_ANON_KEY")!,
		{ global: { headers: { Authorization: authHeader } } },
	);

	// Check if valid / existent User
	const {
		data: { user },
		error: authError,
	} = await supabaseClient.auth.getUser();
	if (!user || authError) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}

	// Delete User
	const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
		user.id,
	);
	if (deleteError) {
		return new Response(JSON.stringify({ error: deleteError.message }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: { ...corsHeaders, "Content-Type": "application/json" },
	});
});
