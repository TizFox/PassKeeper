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

	size = input<string>('w-(--avatar-size)');

	protected initials = computed<string>(() =>
		this.supabase
			.profile()
			.username.split(' ')
			.map((s: string) => s.charAt(0))
			.slice(0, 2)
			.join(''),
	);
}
