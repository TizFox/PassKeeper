import { Component, inject, input, output, computed } from '@angular/core';

import { SupabaseService } from '$/core/supabase.service';
import { Account, Category, DEFAULT_CATEGORY } from '$/core/types';

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

	accountId = input.required<string>();
	onClick = output();

	account = computed<Account>(() => this.supabase.accounts()[this.accountId()]);

	protected currentCategory = computed(() => {
		return this.supabase.categories()[this.account().categoryId] ?? DEFAULT_CATEGORY;
	});
}
