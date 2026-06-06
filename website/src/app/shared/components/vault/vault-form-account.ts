import { Component, input, output, type Signal, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { LucidePencil, LucideX } from '@lucide/angular';

import { Account, Category, DEFAULT_CATEGORY, FormType } from '$/core/types';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';

import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { AreaInput } from '$/shared/components/inputs/area-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
import { CategoryIcon } from '$/shared/components/vault/category-icon';
import { Button } from '$/shared/components/inputs/button';

@Component({
	selector: 'app-vault-form-account',
	templateUrl: './vault-form-account.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [
		ReactiveFormsModule,
		LucidePencil,
		LucideX,
		DashToTitlePipe,
		Container,
		TextInput,
		AreaInput,
		SelectInput,
		CategoryIcon,
		Button,
	],
})
export class VaultFormAccount {
	type = input.required<FormType>();
	categories = input.required<Category[]>();
	close = output<void>();

	account = input<Account | null>();
	createAccount = output<Account>();
	updateAccount = output<Account>();
	deleteAccount = output<Account>();

	protected categoriesNames = computed(() => [
		DEFAULT_CATEGORY.name,
		...this.categories().map((cat: Category) => cat.name),
	]);

	protected accountForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		username: new FormControl('', [Validators.required]),
		password: new FormControl('', [Validators.required]),
		notes: new FormControl(''),
		categoryName: new FormControl(DEFAULT_CATEGORY.name),
	});
	private readonly accountFormValue = toSignal(this.accountForm.valueChanges, {
		initialValue: this.accountForm.getRawValue(),
	});
	protected readonly currentAccount = computed(() => {
		return {
			id: this.account()?.id,
			name: this.accountFormValue().name,
			username: this.accountFormValue().username,
			password: this.accountFormValue().password,
			notes: this.accountFormValue().notes,
			category:
				this.categories().find(
					(cat) => cat.name === this.accountFormValue().categoryName,
				) ?? DEFAULT_CATEGORY,
		} as Account;
	});

	constructor() {
		effect(() => {
			if (this.type() === 'view-account') {
				this.accountForm.patchValue({
					name: this.account()?.name ?? '',
					username: this.account()?.username ?? '',
					password: this.account()?.password ?? '',
					notes: this.account()?.notes ?? '',
					categoryName: this.account()?.category.name ?? DEFAULT_CATEGORY.name,
				});
			}
		});
	}

	protected formSubmit = (e: Event): void => {
		e.preventDefault();

		if (!this.accountForm.valid) {
			return;
		}

		console.log('ACCOUNT FORM SUBMITTED:', this.currentAccount());

		switch (this.type()) {
			case 'new-account':
				this.createAccount.emit(this.currentAccount());
				break;
			case 'view-account':
				this.updateAccount.emit(this.currentAccount());
				break;
			default:
				break;
		}

		this.close.emit();
	};

	protected generatePassword = (): void => {
		this.accountForm.get('password')?.reset('aa');
	};
}
