import { Injectable } from '@angular/core';

import { SupabaseAccount, Account, EncryptedPassword } from './types';
@Injectable({
	providedIn: 'root',
})
export class MasterService {
	private _key: CryptoKey | null = null;

	setPassword = async (password: string, userId: string): Promise<void> => {
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(password + userId),
			'PBKDF2',
			false,
			['deriveKey'],
		);

		this._key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: new TextEncoder().encode(userId),
				iterations: 100000,
				hash: 'SHA-256',
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt'],
		);
	};
	clearPassword = (): void => {
		this._key = null;
	};

	private encrypt = async (password: string): Promise<EncryptedPassword> => {
		if (!this._key) {
			throw Error('No Key');
		}
		if (password === '') {
			return { password: '', iv: '', tag: '' } as EncryptedPassword;
		}

		const iv = crypto.getRandomValues(new Uint8Array(12));
		const encrypted = await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv },
			this._key,
			new TextEncoder().encode(password),
		);

		const full = new Uint8Array(encrypted);
		const encPass = full.slice(0, -16);
		const tag = full.slice(-16);
		return {
			password: btoa(String.fromCharCode(...encPass)),
			iv: btoa(String.fromCharCode(...iv)),
			tag: btoa(String.fromCharCode(...tag)),
		} as EncryptedPassword;
	};
	private decrypt = async (password: EncryptedPassword): Promise<string> => {
		if (!this._key) {
			throw Error('No Key');
		}
		if (password.password === '' && password.iv === '' && password.tag === '') {
			return '';
		}

		const encPass = Uint8Array.from(atob(password.password), (c) => c.charCodeAt(0));
		const iv = Uint8Array.from(atob(password.iv), (c) => c.charCodeAt(0));
		const tag = Uint8Array.from(atob(password.tag), (c) => c.charCodeAt(0));

		const full = new Uint8Array(encPass.length + tag.length);
		full.set(encPass);
		full.set(tag, encPass.length);

		const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, this._key, full);

		return new TextDecoder().decode(decrypted);
	};

	supabaseToAccount = async (supAcc: SupabaseAccount): Promise<Account> => {
		const { password, iv, tag, ...partialAcc } = supAcc;
		const decPass: string = await this.decrypt({
			password,
			iv,
			tag,
		} as EncryptedPassword);

		return {
			...partialAcc,
			password: decPass,
		} as Account;
	};
	accountToSupabase = async (acc: Account): Promise<SupabaseAccount> => {
		const { password, ...partialAcc } = acc;
		const encPass: EncryptedPassword = await this.encrypt(password ?? '');

		return {
			...partialAcc,
			...encPass,
		} as SupabaseAccount;
	};
}
