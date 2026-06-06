import { Component, inject, signal, computed } from '@angular/core';
import { validRoutes } from '$/app.routes';

import { SupabaseService } from '$/core/supabase.service';

import { Logo } from '$/shared/components/base/logo';
import { Avatar } from '$/shared/components/base/avatar';
import { Button } from '$/shared/components/inputs/button';

@Component({
	selector: 'app-header',
	templateUrl: './header.html',
	styleUrl: './header.css',
	imports: [Logo, Avatar, Button],
})
export class Header {
	private supabase: SupabaseService = inject(SupabaseService);

	protected res = signal(validRoutes ?? []);
	protected isLogged = computed(() => !!this.supabase.user);
}
