import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class MasterService {
	private _password: string | null = null;

	setPassword = (s: string) => {
		this._password = s;
	};
	getPassword = (): string | null => {
		return this._password;
	};
	clearPassword = (): void => {
		this._password = null;
	};

	encript = (str: string): string => {
		return 'ENCRYPYED_' + str;
	};
	decript = (enc: string): string => {
		return 'DECRIPTED_' + enc;
	};
}
