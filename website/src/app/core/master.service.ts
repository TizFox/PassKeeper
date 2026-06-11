import { Injectable } from '@angular/core';

import { EncryptedPassword } from './types';
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

		console.log('T1zi4N02004!1!');
		const data = await this.encript('T1zi4N02004!1!');
		console.log(data.encrypted, data.iv, data.tag);
		const pass = await this.decript(data);
		console.log(pass);
	};
	clearPassword = (): void => {
		this._key = null;
	};

	encript = async (password: string): Promise<EncryptedPassword> => {
		if (!this._key) {
			throw Error('No Key');
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
			encrypted: btoa(String.fromCharCode(...encPass)),
			iv: btoa(String.fromCharCode(...iv)),
			tag: btoa(String.fromCharCode(...tag)),
		} as EncryptedPassword;
	};
	decript = async (password: EncryptedPassword): Promise<string> => {
		if (!this._key) {
			throw Error('No Key');
		}

		const encPass = Uint8Array.from(atob(password.encrypted), (c) => c.charCodeAt(0));
		const iv = Uint8Array.from(atob(password.iv), (c) => c.charCodeAt(0));
		const tag = Uint8Array.from(atob(password.tag), (c) => c.charCodeAt(0));

		const full = new Uint8Array(encPass.length + tag.length);
		full.set(encPass);
		full.set(tag, encPass.length);

		const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, this._key, full);

		return new TextDecoder().decode(decrypted);
	};
}
