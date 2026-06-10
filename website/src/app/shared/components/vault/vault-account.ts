import { Component, inject, input, output, computed } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';
import { Account, DEFAULT_CATEGORY } from '$/core/types';

import { Container } from '$/shared/components/base/container';
import { CategoryIcon } from '$/shared/components/vault/category-icon';

@Component({
	selector: 'app-vault-account',
	templateUrl: './vault-account.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [Container, CategoryIcon],
})
export class VaultAccount {
	private supabase: SupabaseService = inject(SupabaseService);

	account = input.required<Account>();
	onClick = output();

	protected currentCategory = computed(() => {
		return this.supabase.categories()[this.account().category_id] ?? DEFAULT_CATEGORY;
	});
}
