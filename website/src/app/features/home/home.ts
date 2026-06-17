import { Component, inject } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';
import { ToastService } from '$/core/toast.service';

import { Button } from '$/shared/components/inputs/button';

@Component({
	selector: 'app-home-page',
	templateUrl: './home.html',
	imports: [Button],
})
export class HomePage {
	private supabase = inject(SupabaseService);
	protected toast = inject(ToastService);
	constructor() {
		this.supabase.checkAuth({ failure: () => {} });
	}
}
