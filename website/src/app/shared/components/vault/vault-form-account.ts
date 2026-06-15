import {
	Component,
	inject,
	input,
	output,
	signal,
	computed,
	effect,
	ChangeDetectionStrategy,
} from '@angular/core';
import { FormRoot, FormField, form, required, email } from '@angular/forms/signals';

import { LucidePencil, LucideTrash2, LucideX } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { Account, Category, DEFAULT_CATEGORY, FormType } from '$/core/types';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';
import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { AreaInput } from '$/shared/components/inputs/area-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
import { CategoryIcon } from '$/shared/components/vault/category-icon';
import { Button } from '$/shared/components/inputs/button';
import { Value } from '$/shared/components/base/value';
import { VaultCategory } from '$/shared/components/vault/vault-category';

interface AccountData {
	name: string;
	username: string;
	email: string;
	password: string;
	notes: string;
	categoryName: string;
}

@Component({
	selector: 'app-vault-form-account',
	templateUrl: './vault-form-account.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [
		FormRoot,
		FormField,
		LucidePencil,
		LucideTrash2,
		LucideX,
		DashToTitlePipe,
		Container,
		TextInput,
		AreaInput,
		SelectInput,
		CategoryIcon,
		Button,
		Value,
		VaultCategory,
	],
})
export class VaultFormAccount {
	private supabase: SupabaseService = inject(SupabaseService);

	type = input.required<FormType>();
	modify = output<void>();
	delete = output<string>();
	close = output<void>();

	accountId = input<string | null>(null);
	private account = computed<Account>(() => this.supabase.accounts()[this.accountId() ?? '']);

	protected possibleCategories = computed<string[]>(() => [
		DEFAULT_CATEGORY.name,
		...Object.values(this.supabase.categories()).map((cat: Category) => cat.name),
	]);

	private accountModel = signal<AccountData>({
		name: '',
		username: '',
		email: '',
		password: '',
		notes: '',
		categoryName: DEFAULT_CATEGORY.name,
	});
	protected accountForm = form(this.accountModel, (schema) => {
		required(schema.name);
		email(schema.email);
		required(schema.categoryName);
	});

	// Set Form Values to input Account
	constructor() {
		effect(() => {
			if (this.type() === 'view-account') {
				this.accountModel.set({
					name: this.account()?.name ?? '',
					username: this.account()?.username ?? '',
					email: this.account()?.email ?? '',
					password: this.account()?.password ?? '',
					notes: this.account()?.notes ?? '',
					categoryName:
						this.supabase.categories()[this.account().category_id]?.name ??
						DEFAULT_CATEGORY.name,
				});
			}
		});
	}

	protected readonly currentAccount = computed<Account>(() => {
		return {
			id: this.accountId() ?? this.account()?.id,
			name: this.accountModel().name,
			username: this.accountModel().username,
			email: this.accountModel().email,
			password: this.accountModel().password,
			notes: this.accountModel().notes,
			category_id: [DEFAULT_CATEGORY, ...Object.values(this.supabase.categories())].find(
				(cat) => cat.name === this.accountModel().categoryName,
			)?.id,
		} as Account;
	});
	protected readonly currentCategory = computed<Category>(() => {
		return this.supabase.categories()[this.currentAccount().category_id] ?? DEFAULT_CATEGORY;
	});

	protected formSubmit = async (e: Event): Promise<void> => {
		e.preventDefault();

		if (!this.accountForm().valid()) {
			return;
		}

		console.log(this.type(), '- FORM SUBMITTED:', this.currentAccount());

		switch (this.type()) {
			case 'new-account':
				await this.supabase.newAccount(this.currentAccount());
				break;
			case 'modify-account':
				await this.supabase.modAccount(this.currentAccount());
				break;
		}

		this.close.emit();
	};

	protected generatePassword = (): void => {
		const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
		const NUMBERS = '01234567890';
		const SYMBOLS = `!#$%&'"()*+,-./:;<=>?@[]^_{|}~`;

		const nLetters = 7;
		const nNumbers = 5;
		const nSymbols = 3;

		let newPassword = '';

		for (let i = 0; i < nLetters; i++) {
			let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
			newPassword += Math.random() > 0.7 ? letter.toUpperCase() : letter;
		}
		for (let i = 0; i < nNumbers; i++) {
			newPassword += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
		}
		for (let i = 0; i < nSymbols; i++) {
			newPassword += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
		}

		newPassword = newPassword
			.split('')
			.map((value) => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value)
			.join('');

		this.accountModel.update((old) => ({ ...old, password: newPassword }));
	};
}
