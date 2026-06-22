import { Component, inject, input, output, signal, computed, linkedSignal } from '@angular/core';
import { FormRoot, form, required, email } from '@angular/forms/signals';

import { LucidePencil, LucideTrash2, LucideX } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { ToastService } from '$/core/toast.service';
import { FormType, Account, Category, DEFAULT_CATEGORY } from '$/core/types';

import { getFormErrors } from '$/shared/utils/form-errors';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';
import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { AreaInput } from '$/shared/components/inputs/area-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
import { CategoryIcon } from '$/shared/components/vault/category-icon';
import { Button } from '$/shared/components/inputs/button';
import { Value } from '$/shared/components/base/value';
import { CategoryRecord } from '$/shared/components/vault/category-record';
import { Confirm } from '$/shared/components/status/confirm';

interface AccountData {
	name: string;
	username: string;
	email: string;
	password: string;
	notes: string;
	categoryName: string;
}

@Component({
	selector: 'app-account-form',
	templateUrl: './account-form.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [
		FormRoot,
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
		CategoryRecord,
		Confirm,
	],
})
export class AccountForm {
	private supabase: SupabaseService = inject(SupabaseService);
	private toast: ToastService = inject(ToastService);

	type = input.required<FormType>();
	modify = output<void>();
	delete = output<string>();
	close = output<void>();

	accountId = input<string | null>(null);
	private account = computed<Account | undefined>(
		() => this.supabase.accounts()[this.accountId() ?? ''],
	);

	protected possibleCategories = computed<string[]>(() => [
		DEFAULT_CATEGORY.name,
		...Object.values(this.supabase.categories()).map((cat: Category) => cat.name),
	]);

	private accountModel = linkedSignal<AccountData>(() => {
		if (
			this.account() &&
			(this.type() === 'view-account' || this.type() === 'modify-account')
		) {
			// Set Form Values to input Account
			return {
				name: this.account()?.name,
				username: this.account()?.username ?? '',
				email: this.account()?.email ?? '',
				password: this.account()?.password ?? '',
				notes: this.account()?.notes ?? '',
				categoryName:
					this.supabase.categories()[this.account()?.category_id ?? '']?.name ??
					DEFAULT_CATEGORY.name,
			} as AccountData;
		}
		return {
			name: '',
			username: '',
			email: '',
			password: '',
			notes: '',
			categoryName: DEFAULT_CATEGORY.name,
		} as AccountData;
	});
	protected accountForm = form(this.accountModel, (schema) => {
		required(schema.name, { message: 'Missing Account Name' });
		email(schema.email, { message: 'Invalid Email' });
	});

	protected readonly currentAccount = computed<Account>(() => {
		const categoryId = [DEFAULT_CATEGORY, ...Object.values(this.supabase.categories())].find(
			(cat) => cat.name === this.accountModel().categoryName,
		)?.id;

		return {
			id: this.accountId(),
			name: this.accountModel().name,
			username: this.accountModel().username,
			email: this.accountModel().email,
			password: this.accountModel().password,
			notes: this.accountModel().notes,
			category_id: categoryId === '' ? null : categoryId,
		} as Account;
	});
	protected readonly currentCategory = computed<Category>(() => {
		return this.supabase.categories()[this.currentAccount().category_id] ?? DEFAULT_CATEGORY;
	});

	protected formSubmit = async (e: Event): Promise<void> => {
		e.preventDefault();

		this.accountForm().markAsTouched();
		if (this.accountForm().invalid()) {
			this.toast.warning(
				'Invalid Account Info',
				getFormErrors(this.accountModel(), this.accountForm),
			);
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
		function safeRandom(max: number): number {
			const arr = new Uint32Array(1);
			crypto.getRandomValues(arr);
			return arr[0] % max;
		}
		function shuffle(password: string): string {
			// Fisher-Yates
			const letters = password.split('');
			for (let i = letters.length - 1; i > 0; i--) {
				const j = safeRandom(i + 1);
				[letters[i], letters[j]] = [letters[j], letters[i]];
			}
			return letters.join('');
		}

		const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
		const NUMBERS = '0123456789';
		const SYMBOLS = `!#$%&'"()*+,-./:;<=>?@[]^_{|}~`;

		const nLetters = 7;
		const nNumbers = 5;
		const nSymbols = 4;
		let newPassword = '';

		for (let i = 0; i < nLetters; i++) {
			const letter = LETTERS[safeRandom(LETTERS.length)];
			newPassword += safeRandom(10) > 6 ? letter.toUpperCase() : letter;
		}
		for (let i = 0; i < nNumbers; i++) {
			newPassword += NUMBERS[safeRandom(NUMBERS.length)];
		}
		for (let i = 0; i < nSymbols; i++) {
			newPassword += SYMBOLS[safeRandom(SYMBOLS.length)];
		}

		newPassword = shuffle(newPassword);

		this.accountModel.update((old) => ({ ...old, password: newPassword }));
	};

	protected showConfirmDelete = signal<boolean>(false);
	protected closeConfirmDelete = (confirmed: boolean): void => {
		this.showConfirmDelete.set(false);

		if (!confirmed) {
			return;
		}

		this.delete.emit(this.currentAccount().id);
	};
}
