import { Component, inject, input, booleanAttribute, computed } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';

@Component({
	selector: 'app-avatar',
	templateUrl: './avatar.html',
	styles: `
		:host {
			display: contents;
		}
	`,
})
export class Avatar {
	private supabase: SupabaseService = inject(SupabaseService);

	size = input<string>('w-(--avatar-size)');
	noHover = input(false, { transform: booleanAttribute });

	protected initials = computed<string>(() =>
		this.supabase
			.profile()
			.username.split(' ')
			.map((s: string) => s.charAt(0))
			.slice(0, 2)
			.join(''),
	);
}
