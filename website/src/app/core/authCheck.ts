import { effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SupabaseService } from './supabase.service';

export const checkAuth = async (callback: () => unknown) => {
	const router = inject(Router);
	const supabase = inject(SupabaseService);

	effect(async () => {
		if (!supabase.loading()) {
			if (!supabase.user) {
				router.navigate(['/auth']);
			} else {
				await callback();
			}
		}
	});
};
