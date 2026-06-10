import { Injectable, inject, PLATFORM_ID, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import {
	SupabaseClient,
	createClient,
	User,
	AuthChangeEvent,
	Session,
} from '@supabase/supabase-js';

import { env } from 'src/env';
import { MasterService } from '$/core/master.service';
import { Profile, Account, Category } from '$/core/types';

@Injectable({
	providedIn: 'root',
})
export class SupabaseService {
	private platformId = inject(PLATFORM_ID);
	private router: Router = inject(Router);
	private master: MasterService = inject(MasterService);

	private supabase: SupabaseClient;
	private _user = signal<User | null>(null);
	get user(): User | null {
		return this._user();
	}
	loading = signal(true);

	constructor() {
		this.supabase = createClient(env.supabaseUrl, env.supabaseKey);

		if (!isPlatformBrowser(this.platformId)) {
			return; // SSR
		}

		this.supabase.auth.onAuthStateChange(
			async (event: AuthChangeEvent, session: Session | null) => {
				if (event === 'INITIAL_SESSION') {
					const { data, error } = await this.supabase.auth.getUser();
					this._user.set(error ? null : data.user);
					this.loading.set(false);
				} else if (!session || event === 'SIGNED_OUT') {
					this._user.set(null);
				} else {
					this._user.set(session.user);
				}
			},
		);
	}
	checkAuth = async (callback?: () => unknown) => {
		effect(async () => {
			if (!this.loading()) {
				if (!this._user()) {
					this.router.navigate(['/auth']);
				} else {
					await this.loadData();
					if (callback) {
						await callback();
					}
				}
			}
		});
	};

	private _profile = signal<Profile>({ email: '', createdAt: '', username: '' });
	private _accounts = signal<Account[]>([]);
	private _categories = signal<Category[]>([]);

	get profile(): Profile {
		return this._profile();
	}
	readonly accounts = computed<Record<string, Account>>(() => {
		let obj: Record<string, Account> = {};
		this._accounts().forEach((acc) => (obj[acc.id] = acc));
		return obj;
	});
	readonly accountsIds = computed<string[]>(() => this._accounts().map((acc) => acc.id));
	readonly categories = computed<Record<string, Category>>(() => {
		let obj: Record<string, Category> = {};
		this._categories().forEach((cat) => (obj[cat.id] = cat));
		return obj;
	});
	readonly categoriesIds = computed<string[]>(() => this._categories().map((cat) => cat.id));

	login = async (
		email: string,
		password: string,
	): Promise<{ user: User | null; err: string | null }> => {
		const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

		if (!error) {
			this.master.setPassword(password);
		}

		return {
			user: data.user,
			err: error?.message ?? null,
		};
	};
	signup = async (
		username: string,
		email: string,
		password: string,
	): Promise<{ user: User | null; err: string | null }> => {
		const { data, error } = await this.supabase.auth.signUp({
			email,
			password,
			options: { data: { username } },
		});

		if (!error) {
			this.master.setPassword(password);
		}

		return {
			user: data.user,
			err: error?.message ?? null,
		};
	};
	logout = async (): Promise<{ err: string | null }> => {
		const { error } = await this.supabase.auth.signOut();

		if (!error) {
			this.master.clearPassword();
		}

		return {
			err: error?.message ?? null,
		};
	};

	getAccounts = async (): Promise<Account[]> => {
		let { data, error } = await this.supabase.from('accounts').select('*');
		if (error || !data) {
			console.log(error);
			return [];
		}

		let accounts = data.map((acc) => {
			return {
				id: acc.id,
				name: acc.name,
				username: acc.username,
				password: acc.password,
				notes: acc.notes,
				categoryId: acc.categoty_id,
			} as Account;
		});

		console.log(accounts);

		return accounts;
	};
	getCategories = async (): Promise<Category[]> => {
		let { data, error } = await this.supabase.from('categories').select('*');
		if (error || !data) {
			console.log(error);
			return [];
		}

		let categories = data.map((cat) => {
			return {
				id: cat.id,
				name: cat.name,
				color: cat.color,
				icon: cat.icon,
			} as Category;
		});

		console.log(categories);

		return categories;
	};

	loadData = async () => {
		this._profile.set({
			email: this._user()?.email!,
			createdAt: formatDate(this._user()?.created_at!),
			username: this._user()?.user_metadata['username'],
		});

		this._accounts.set([
			{
				id: '0',
				name: 'test',
				username: 'test',
				password: 'test',
				notes: 'test',
				categoryId: '0',
			},
		]); // await this.supabase.getAccounts());
		this._categories.set([{ id: '0', name: 'test', icon: 'finance', color: '#ff0000' }]); //await this.supabase.getCategories());
	};

	updateProfile = async ({
		newUsername,
		newPassword,
	}: {
		newUsername: string | null;
		newPassword: string | null;
	}): Promise<{ err: string | null }> => {
		if (newUsername) {
			const { error } = await this.supabase.auth.updateUser({
				data: { username: newUsername },
			});

			if (error) {
				return { err: error.message };
			}
		}
		if (newPassword) {
			const { error } = await this.supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				return { err: error.message };
			}
		}

		return { err: null };
	};

	newAccount = async (acc: Account) => {
		// Supabase Query

		acc.id = String(this._accounts().length + 1);
		this._accounts.update((old) => [...old, acc]);
	};
	modAccount = async (acc: Account) => {
		// Supabase Query

		this._accounts.update((old) => old.map((oldAcc) => (oldAcc.id === acc.id ? acc : oldAcc)));
	};
	delAccount = async (acc: Account) => {
		// Supabase Query

		this._categories.update((old) => old.filter((oldAcc) => oldAcc.id !== acc.id));
	};

	newCategory = async (cat: Category) => {
		// Supabase Query

		cat.id = String(this._categories().length + 1);
		this._categories.update((old) => [...old, cat]);
	};
	modCategory = async (cat: Category) => {
		// Supabase Query

		this._categories.update((old) =>
			old.map((oldCat) => (oldCat.id === cat.id ? cat : oldCat)),
		);
	};
	delCategory = async (cat: Category) => {
		// Supabase Query

		this._categories.update((old) => old.filter((oldCat) => oldCat.id !== cat.id));
	};
}

function twoDigit(n: number): string {
	return (Math.floor(n / 10) === 0 ? '0' : '') + n;
}
function formatDate(s: string): string {
	let date = new Date(s);
	return `${twoDigit(date.getDate())} / ${twoDigit(date.getMonth() + 1)} / ${date.getFullYear()} - ${twoDigit(date.getHours())}:${twoDigit(date.getMinutes())}`;
}
