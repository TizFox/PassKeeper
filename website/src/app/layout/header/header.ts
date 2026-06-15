import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';
import { User } from '@supabase/supabase-js';

import { Loading } from '$/shared/components/status/loading';

import { Logo } from '$/shared/components/base/logo';
import { Avatar } from '$/shared/components/base/avatar';
import { Button } from '$/shared/components/inputs/button';

@Component({
	selector: 'app-header',
	templateUrl: './header.html',
	styleUrl: './header.css',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [Loading, Logo, Avatar, Button],
})
export class Header {
	private supabase: SupabaseService = inject(SupabaseService);

	protected setup = computed<boolean>(() => this.supabase.loading());
	protected user = computed<User | null>(() => this.supabase.user);
}
