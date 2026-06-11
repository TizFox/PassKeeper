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
import { PassThrough } from 'stream';

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
	loading = signal<boolean>(true);

	constructor() {
		this.supabase = createClient(env.supabaseUrl, env.supabaseKey); /* , {
			auth: {
				// Ask login every time, to set the masterKey
				// To not save the masterKey in browser storage (not safe)
				persistSession: false,
				autoRefreshToken: false,
			},
		});*/

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
		let check = effect(async () => {
			if (!this.loading()) {
				if (!this._user()) {
					this.router.navigate(['/auth']);
				} else {
					await this.loadData();
					if (callback) {
						await callback();
					}
				}
				check.destroy();
			}
		});
	};

	private _profile = signal<Profile>({ email: '', createdAt: '', username: '' });
	readonly profile = this._profile.asReadonly();
	private _accounts = signal<Account[]>([]);
	private _categories = signal<Category[]>([]);

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
			this.master.setPassword(password, this._user()?.id!);
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
			this.master.setPassword(password, this._user()?.id!);
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
				category_id: acc.category_id,
			} as Account;
		});

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

		return categories;
	};

	loadData = async () => {
		this.loading.set(true);

		this._profile.set({
			email: this._user()?.email!,
			createdAt: formatDate(this._user()?.created_at!),
			username: this._user()?.user_metadata['username'],
		});

		this._accounts.set(await this.getAccounts());
		this._categories.set(await this.getCategories());

		this.loading.set(false);
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
			this._profile.update((old) => ({ ...old, username: newUsername }) as Profile);
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
		const { id, ...insertAcc } = acc;

		console.log(insertAcc);

		const { data, error } = await this.supabase
			.from('accounts')
			.insert({
				user_id: this._user()?.id!,
				...insertAcc,
			})
			.select()
			.single();
		if (error) {
			console.log(error.message);
			return;
		}

		acc.id = data.id;
		this._accounts.update((old) => [...old, acc]);
	};
	modAccount = async (acc: Account) => {
		const { error } = await this.supabase
			.from('accounts')
			.update(acc)
			.eq('id', acc.id)
			.eq('user_id', this._user()?.id!);
		if (error) {
			console.log(error.message);
			return;
		}

		this._accounts.update((old) => old.map((oldAcc) => (oldAcc.id === acc.id ? acc : oldAcc)));
	};
	delAccount = async (accId: string) => {
		const { error } = await this.supabase
			.from('accounts')
			.delete()
			.eq('id', accId)
			.eq('user_id', this._user()?.id!);
		if (error) {
			console.log(error.message);
			return;
		}

		this._accounts.update((old) => old.filter((oldAcc) => oldAcc.id !== accId));
	};

	newCategory = async (cat: Category) => {
		const { id, ...insertCat } = cat;
		const { data, error } = await this.supabase
			.from('categories')
			.insert({
				user_id: this._user()?.id!,
				...insertCat,
			})
			.select()
			.single();
		if (error) {
			console.log(error.message);
			return;
		}

		cat.id = data.id;
		this._categories.update((old) => [...old, cat]);
	};
	modCategory = async (cat: Category) => {
		const { error } = await this.supabase
			.from('categories')
			.update(cat)
			.eq('id', cat.id)
			.eq('user_id', this._user()?.id!);
		if (error) {
			console.log(error.message);
			return;
		}

		this._categories.update((old) =>
			old.map((oldCat) => (oldCat.id === cat.id ? cat : oldCat)),
		);
	};
	delCategory = async (catId: string) => {
		const { error } = await this.supabase
			.from('categories')
			.delete()
			.eq('id', catId)
			.eq('user_id', this._user()?.id!);
		if (error) {
			console.log(error.message);
			return;
		}

		this._categories.update((old) => old.filter((oldCat) => oldCat.id !== catId));
	};
}

function twoDigit(n: number): string {
	return (Math.floor(n / 10) === 0 ? '0' : '') + n;
}
function formatDate(s: string): string {
	let date = new Date(s);
	return `${twoDigit(date.getDate())} / ${twoDigit(date.getMonth() + 1)} / ${date.getFullYear()} - ${twoDigit(date.getHours())}:${twoDigit(date.getMinutes())}`;
}
