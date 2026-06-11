import { Component, inject } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';

import { Loading } from '$/shared/components/status/loading';

import { Logo } from '$/shared/components/base/logo';
import { Avatar } from '$/shared/components/base/avatar';
import { Button } from '$/shared/components/inputs/button';

@Component({
	selector: 'app-header',
	templateUrl: './header.html',
	styleUrl: './header.css',
	imports: [Loading, Logo, Avatar, Button],
})
export class Header {
	protected supabase: SupabaseService = inject(SupabaseService);
}
