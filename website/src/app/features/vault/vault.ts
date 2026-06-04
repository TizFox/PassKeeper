import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { SupabaseService } from '$/core/supabase.service';
import { checkAuth } from '$/core/authCheck';

import { LucideX } from '@lucide/angular';

import { Popup } from '$/shared/components/popup/popup';
import { TextInput } from '$/shared/components/text-input/text-input';
import { AreaInput } from '$/shared/components/area-input/area-input';
import { Button } from '$/shared/components/button/button';

import { Empty } from '$/shared/components/empty/empty';
import { Loading } from '$/shared/components/loading/loading';

@Component({
	selector: 'app-vault',
	templateUrl: './vault.html',
	imports: [ReactiveFormsModule, LucideX, Popup, TextInput, AreaInput, Button, Empty, Loading],
})
export class Vault {
	private supabase = inject(SupabaseService);

	private loading = signal(false);
	protected ready = computed(() => !this.loading() && !this.supabase.loading());

	protected accounts = signal([]);

	constructor() {
		checkAuth(this.loadAccounts);
	}

	loadAccounts = async () => {};

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
		this.viewNewAccount.set(false);
	};
}
