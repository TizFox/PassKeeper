import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { SupabaseService } from '$/core/supabase.service';
import { checkAuth } from '$/core/authCheck';
import { Account } from '$/core/types';

import { LucideX, LucidePlus } from '@lucide/angular';

import { Popup } from '$/shared/components/popup/popup';
import { TextInput } from '$/shared/components/text-input/text-input';
import { AreaInput } from '$/shared/components/area-input/area-input';
import { Button } from '$/shared/components/button/button';
import { VaultAccount } from '$/shared/components/vault-account/vault-account';

import { Empty } from '$/shared/components/empty/empty';
import { Loading } from '$/shared/components/loading/loading';

@Component({
	selector: 'app-vault',
	templateUrl: './vault.html',
	imports: [
		ReactiveFormsModule,
		LucideX,
		LucidePlus,
		Popup,
		TextInput,
		AreaInput,
		Button,
		VaultAccount,
		Empty,
		Loading,
	],
})
export class Vault {
	private supabase = inject(SupabaseService);

	loading = signal(false);
	protected ready = computed(() => !this.loading() && !this.supabase.loading());

	protected accounts = signal<Account[]>([
		{
			name: 'AAA',
			username: 'AAA',
			password: 'AAA',
			notes: 'AAA',
			category: { text: 'default', color: '#ff0000' },
		},
	]);

	constructor() {
		checkAuth(this.loadAccounts);
	}

	private loadAccounts = async () => {};

	protected newAccountForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		username: new FormControl('', [Validators.required]),
		password: new FormControl('', [Validators.required]),
		notes: new FormControl(''),
	});

	protected generatePassword = (): void => {
		this.newAccountForm.get('password')?.reset('aa');
	};

	protected viewNewAccount = signal(false);
	protected openNewAccount = (): void => {
		this.viewNewAccount.set(true);
	};
	protected closeNewAccount = (): void => {
		this.newAccountForm.reset();
		this.viewNewAccount.set(false);
	};

	protected createNewAccount = (e: Event): void => {
		e.preventDefault();

		if (!this.newAccountForm.valid) {
			return;
		}

		this.loading.set(true);

		this.accounts.update((x) => [
			...x,
			{
				name: this.newAccountForm.value.name!,
				username: this.newAccountForm.value.username!,
				password: this.newAccountForm.value.password!,
				notes: this.newAccountForm.value.notes!,
				category: { text: 'default', color: '#ff0000' },
			},
		]);

		console.log(
			this.newAccountForm.value.name,
			this.newAccountForm.value.username,
			this.newAccountForm.value.password,
			this.newAccountForm.value.notes,
		);

		this.loading.set(false);
	};
}
