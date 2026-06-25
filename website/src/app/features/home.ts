import { Component, inject } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';

@Component({
	selector: 'app-home-page',
	templateUrl: './home.html',
	imports: [],
})
export class HomePage {
	private supabase = inject(SupabaseService);
	constructor() {
		this.supabase.checkAuth({ failure: () => {} });
	}
}
