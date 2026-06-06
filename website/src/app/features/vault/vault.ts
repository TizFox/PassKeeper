import { Component, inject, signal, computed } from '@angular/core';

import { LucidePlus } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { checkAuth } from '$/core/authCheck';
import { Account, Category, FormType } from '$/core/types';

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
	private supabase = inject(SupabaseService);

	protected loading = signal(true);
	protected ready = computed(() => !this.loading() && !this.supabase.loading());

	protected accounts = signal<Account[]>([]);
	protected readonly accountsMap = computed<Map<string, Account>>(
		() => new Map(this.accounts().map((acc) => [acc.id, acc])),
	);
	protected categories = signal<Category[]>([]);
	protected readonly categoriesMap = computed<Map<string, Category>>(
		() => new Map(this.categories().map((cat) => [cat.id, cat])),
	);

	constructor() {
		checkAuth(this.loadData);
	}

	private loadData = async () => {
		this.accounts.set([]); // await this.supabase.getAccounts());
		this.categories.set([]); //await this.supabase.getCategories());

		this.loading.set(false);
	};

	protected selectedAccount = signal<Account | null>(null);
	protected selectedCategory = signal<Category | null>(null);
	protected showAccountForm = signal(false);
	protected showCategoryForm = signal(false);
	protected formType: FormType = 'new-account';

	protected newAccountForm = () => {
		this.openForm('new-account');
	};
	protected viewAccountForm = (acc: Account) => {
		this.openForm('view-account', acc, null);
	};
	protected newCategoryForm = () => {
		this.openForm('new-category');
	};
	protected viewCategoryForm = (cat: Category) => {
		this.openForm('view-category', null, cat);
	};
	private openForm = (
		type: FormType | null = null,
		selectedAccount: Account | null = null,
		selectedCategory: Category | null = null,
	): void => {
		this.closeForm();

		this.formType = type ? type : this.formType;

		switch (this.formType) {
			case 'new-account':
			case 'view-account':
				this.selectedAccount.set(selectedAccount);
				this.showAccountForm.set(true);
				break;
			case 'new-category':
			case 'view-category':
				this.selectedCategory.set(selectedCategory);
				this.showCategoryForm.set(true);
				break;
		}
	};
	protected closeForm = (): void => {
		this.selectedAccount.set(null);
		this.selectedCategory.set(null);
		this.showAccountForm.set(false);
		this.showCategoryForm.set(false);
	};

	protected createAccount = (acc: Account): void => {
		this.loading.set(true);

		acc.id = String(this.accounts().length + 1);
		this.accounts.update((old) => [...old, acc]);

		this.loading.set(false);
	};
	protected updateAccount = (acc: Account): void => {};
	protected deleteAccount = (acc: Account): void => {};

	protected createCategory = (cat: Category): void => {
		this.loading.set(true);

		// Supabase Query

		cat.id = String(this.categories().length + 1);
		this.categories.update((old) => [...old, cat]);

		this.loading.set(false);
	};
	protected updateCategory = (cat: Category): void => {
		this.loading.set(true);

		// Supabase Query

		let updatedIndex = this.categories().findIndex((old: Category) => old.id === cat.id);
		this.categories.update((old) => {
			old.splice(updatedIndex, 1, cat);
			return old;
		});

		this.loading.set(false);
	};
	protected deleteCategory = (cat: Category): void => {
		this.loading.set(true);

		// Supabase Query

		let deletedIndex = this.categories().findIndex((old: Category) => old.id === cat.id);
		this.categories.update((old) => {
			old.splice(deletedIndex, 1);
			return old;
		});

		this.loading.set(false);
	};
}
