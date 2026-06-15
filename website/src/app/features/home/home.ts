import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';

@Component({
	selector: 'app-home-page',
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './home.html',
})
export class HomePage {
	private supabase = inject(SupabaseService);
	constructor() {
		this.supabase.checkAuth({ failure: () => {} });
	}
}
