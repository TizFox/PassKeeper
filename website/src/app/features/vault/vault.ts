import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormRoot, FormField, form } from '@angular/forms/signals';

import { LucidePlus } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { Account, Category, DEFAULT_CATEGORY, FormType } from '$/core/types';

import { Loading } from '$/shared/components/status/loading';
import { Empty } from '$/shared/components/status/empty';

import { TextInput } from '$/shared/components/inputs/text-input';
import { SelectInput } from '$/shared/components/inputs/select-input';

import { VaultFormAccount } from '$/shared/components/vault/vault-form-account';
import { VaultFormCategory } from '$/shared/components/vault/vault-form-category';
import { Button } from '$/shared/components/inputs/button';
import { VaultAccount } from '$/shared/components/vault/vault-account';
import { VaultCategory } from '$/shared/components/vault/vault-category';

const JOLLY_CATEGORY_NAME = 'all';

interface SearchData {
	search: string;
	categoryName: string;
}

@Component({
	selector: 'app-vault-page',
	templateUrl: './vault.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [
		FormRoot,
		FormField,
		LucidePlus,
		Loading,
		Empty,
		TextInput,
		SelectInput,
		VaultFormAccount,
		VaultFormCategory,
		Button,
		VaultAccount,
		VaultCategory,
	],
})
export class VaultPage {
	private supabase: SupabaseService = inject(SupabaseService);
	constructor() {
		this.supabase.checkAuth({ loadAll: true });
	}
	protected setup = computed<boolean>(() => this.supabase.loading());
	protected accountsIds = computed<string[]>(() => this.supabase.accountsIds());
	protected accountsMap = computed<Record<string, Account>>(() => this.supabase.accounts());
	protected categoriesIds = computed<string[]>(() => this.supabase.categoriesIds());
	protected categoriesMap = computed<Record<string, Category>>(() => this.supabase.categories());

	protected possibleCategories = computed<string[]>(() => [
		JOLLY_CATEGORY_NAME,
		DEFAULT_CATEGORY.name,
		...Object.values(this.supabase.categories()).map((cat: Category) => cat.name),
	]);
	private searchModel = signal<SearchData>({ search: '', categoryName: JOLLY_CATEGORY_NAME });
	protected searchForm = form(this.searchModel);
	protected filteredAccountsIds = computed<string[]>(() =>
		this.supabase.accountsIds().filter((id) => {
			let account = this.supabase.accounts()[id];
			let category = this.supabase.categories()[account.category_id] ?? DEFAULT_CATEGORY;

			let filteredCategory = [
				DEFAULT_CATEGORY,
				...Object.values(this.supabase.categories()),
			].find((cat) => cat.name === this.searchModel().categoryName);

			return (
				(!filteredCategory /*all*/ || category.id === filteredCategory.id) &&
				account.name.includes(this.searchModel().search)
			);
		}),
	);

	protected selectedAccountId = signal<string | null>(null);
	protected selectedCategoryId = signal<string | null>(null);
	protected formType = signal<FormType>('no-form');
	protected formData = computed<string>(() => this.formType().split('-')[1]); // form | account | category

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
		switch (this.formData()) {
			case 'account':
				this.formType.set('modify-account');
				break;
			case 'category':
				this.formType.set('modify-category');
				break;
			default:
				this.formType.set('no-form');
				break;
		}
	};
	protected deleteForm = async (id: string): Promise<void> => {
		switch (this.formData()) {
			case 'account':
				await this.supabase.delAccount(id);
				break;
			case 'category':
				await this.supabase.delCategory(id);
				break;
		}

		this.closeForm();
	};
	protected closeForm = (): void => {
		this.formType.set('no-form');
		this.selectedAccountId.set(null);
		this.selectedCategoryId.set(null);
	};
}
