import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = ['"https://tizfox.github.io', 'http://localhost:4200'];

Deno.serve(async (req) => {
	const origin = req.headers.get('Origin') ?? '';
	const corsHeaders = {
		'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
		'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	};

	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	const supabaseAdmin = createClient(
		Deno.env.get('SUPABASE_URL')!,
		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
	);

	const authHeader = req.headers.get('Authorization');
	const supabaseClient = createClient(
		Deno.env.get('SUPABASE_URL')!,
		Deno.env.get('SUPABASE_ANON_KEY')!,
		{ global: { headers: { Authorization: authHeader } } },
	);

	const {
		data: { user },
		error: authError,
	} = await supabaseClient.auth.getUser();
	if (!user || authError) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
	if (deleteError) {
		return new Response(JSON.stringify({ error: deleteError.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
});
