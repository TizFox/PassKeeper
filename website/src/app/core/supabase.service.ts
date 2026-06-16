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
import { Profile, Account, SupabaseAccount, Category } from '$/core/types';

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
		this.supabase = createClient(env.supabaseUrl, env.supabaseKey, {
			auth: {
				// Ask login every time, to set the masterKey
				// To not save the masterKey in browser storage (not safe)
				persistSession: false,
				autoRefreshToken: false,
			},
		});

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
	checkAuth = async ({
		success,
		failure = () => this.router.navigate(['/auth']),
		loadAll = false,
	}: {
		success?: () => unknown;
		failure?: () => unknown;
		loadAll?: boolean;
	}) => {
		const check = effect(async () => {
			if (!this.loading()) {
				if (!this._user()) {
					await failure();
				} else {
					this.loading.set(true);
					await this.loadProfile();
					if (loadAll) {
						await this.loadAccounts();
						await this.loadCategories();
					}
					if (success) {
						success();
					}
					this.loading.set(false);
				}
				check.destroy();
			}
		});
	};

	private _profile = signal<Profile>({ email: '', createdAt: '', username: '' });
	private _accounts = signal<Account[]>([]);
	private _categories = signal<Category[]>([]);

	readonly profile = this._profile.asReadonly();
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

	login = async (email: string, password: string): Promise<string | null> => {
		const { error } = await this.supabase.auth.signInWithPassword({ email, password });

		if (!error) {
			this.master.setPassword(password, this._user()?.id!);
		}

		return error?.message ?? null;
	};
	signup = async (username: string, email: string, password: string): Promise<string | null> => {
		const { error } = await this.supabase.auth.signUp({
			email,
			password,
			options: { data: { username } },
		});

		if (!error) {
			this.master.setPassword(password, this._user()?.id!);
		}

		return error?.message ?? null;
	};
	updateProfile = async ({
		newUsername,
		newPassword,
	}: {
		newUsername: string | null;
		newPassword: string | null;
	}): Promise<string | null> => {
		if (newUsername) {
			const { error } = await this.supabase.auth.updateUser({
				data: { username: newUsername },
			});

			if (error) {
				return error.message;
			}
			this._profile.update((old) => ({ ...old, username: newUsername }) as Profile);
		}
		if (newPassword) {
			const { error } = await this.supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				return error.message;
			}
		}

		return null;
	};
	logout = async (): Promise<string | null> => {
		const { error } = await this.supabase.auth.signOut();

		if (!error) {
			this.master.clearPassword();
		}

		return error?.message ?? null;
	};
	deleteUser = async (): Promise<string | null> => {
		const { error } = await this.supabase.functions.invoke('delete-user');
		return error?.message ?? null;
	};

	private getAccounts = async (): Promise<Account[]> => {
		const {
			data,
			error,
		}: {
			data: SupabaseAccount[] | null;
			error: any;
		} = await this.supabase.from('accounts').select('*');
		if (error || !data) {
			console.log(error);
			return [];
		}

		const accounts = await Promise.all(
			data.map(async (supAcc) => await this.master.supabaseToAccount(supAcc)),
		);

		return accounts;
	};
	private getCategories = async (): Promise<Category[]> => {
		const { data, error }: { data: Category[] | null; error: any } = await this.supabase
			.from('categories')
			.select('*');
		if (error || !data) {
			console.log(error);
			return [];
		}

		return data;
	};

	private loadProfile = async () => {
		this._profile.set({
			email: this._user()?.email!,
			createdAt: formatDate(this._user()?.created_at!),
			username: this._user()?.user_metadata['username'],
		});
	};
	private loadAccounts = async () => {
		this._accounts.set(await this.getAccounts());
	};
	private loadCategories = async () => {
		this._categories.set(await this.getCategories());
	};

	newAccount = async (acc: Account) => {
		const { id, ...insertAcc } = await this.master.accountToSupabase(acc);

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
		const updateAcc = await this.master.accountToSupabase(acc);

		const { error } = await this.supabase
			.from('accounts')
			.update(updateAcc)
			.eq('id', updateAcc.id)
			.eq('user_id', this._user()?.id!);
		if (error) {
			console.log(error.message);
			return;
		}

		this._accounts.update((old) => old.map((oldAcc) => (acc.id === oldAcc.id ? acc : oldAcc)));
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

		this._accounts.update((old) => old.filter((oldAcc) => accId !== oldAcc.id));
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
	const date = new Date(s);
	return `${twoDigit(date.getDate())} / ${twoDigit(date.getMonth() + 1)} / ${date.getFullYear()} - ${twoDigit(date.getHours())}:${twoDigit(date.getMinutes())}`;
}
