import { Component, inject, signal, computed } from '@angular/core';

import { LucidePlus } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { FormType } from '$/core/types';

import { VaultFormAccount } from '$/shared/components/vault/vault-form-account';
import { VaultFormCategory } from '$/shared/components/vault/vault-form-category';
import { Button } from '$/shared/components/inputs/button';
import { VaultAccount } from '$/shared/components/vault/vault-account';
import { VaultCategory } from '$/shared/components/vault/vault-category';
import { Empty } from '$/shared/components/status/empty';
import { Loading } from '$/shared/components/status/loading';

@Component({
	selector: 'app-vault',
	templateUrl: './vault.html',
	imports: [
		LucidePlus,
		VaultFormAccount,
		VaultFormCategory,
		Button,
		VaultAccount,
		VaultCategory,
		Empty,
		Loading,
	],
})
export class Vault {
	protected supabase: SupabaseService = inject(SupabaseService);

	protected loading = signal(false);
	protected ready = computed(() => !this.loading() && !this.supabase.loading());

	constructor() {
		this.supabase.checkAuth(this.supabase.loadData);
	}

	protected selectedAccountId = signal<string | null>(null);
	protected selectedCategoryId = signal<string | null>(null);
	protected formType = signal<FormType>('no-form');

	protected newAccountForm = () => {
		this.formType.set('new-account');
		this.selectedAccountId.set(null);
	};
	protected viewAccountForm = (accId: string) => {
		this.formType.set('view-account');
		this.selectedAccountId.set(accId);
	};
	protected newCategoryForm = () => {
		this.formType.set('new-category');
		this.selectedCategoryId.set(null);
	};
	protected viewCategoryForm = (catId: string) => {
		this.formType.set('view-category');
		this.selectedCategoryId.set(catId);
	};
	protected modifyForm = (): void => {
		this.formType.update((old) => {
			switch (old.split('-')[1]) {
				case 'account':
					return 'modify-account';
				case 'category':
					return 'modify-category';
				default:
					return 'no-form';
			}
		});
	};
	protected closeForm = (): void => {
		this.formType.set('no-form');
		this.selectedAccountId.set(null);
		this.selectedCategoryId.set(null);
	};
}
