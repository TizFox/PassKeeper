import { Component, inject } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';

import { Empty } from '$/shared/components/status/empty';

@Component({
	selector: 'app-not-found-page',
	templateUrl: './not-found.html',
	imports: [Empty],
})
export class NotFoundPage {
	private supabase = inject(SupabaseService);
	constructor() {
		this.supabase.checkAuth({ failure: () => {} });
	}
}
