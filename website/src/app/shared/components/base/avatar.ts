import { Component, inject, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SupabaseService } from '$/core/supabase.service';

@Component({
	selector: 'app-avatar',
	templateUrl: './avatar.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [RouterLink],
})
export class Avatar {
	private supabase: SupabaseService = inject(SupabaseService);

	size = input('w-(--avatar-size)');

	protected initials = computed(() =>
		this.supabase.user?.user_metadata['username']
			.split(' ')
			.map((s: string) => s.charAt(0))
			.slice(0, 2)
			.join(''),
	);
}
