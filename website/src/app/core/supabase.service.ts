import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Account, Category } from './types';

import {
	SupabaseClient,
	createClient,
	User,
	AuthChangeEvent,
	Session,
	AuthWeakPasswordError,
} from '@supabase/supabase-js';

import { env } from 'src/env';
import { MasterService } from '$/core/master.service';

@Injectable({
	providedIn: 'root',
})
export class SupabaseService {
	private platformId = inject(PLATFORM_ID);
	private master: MasterService = inject(MasterService);

	private supabase: SupabaseClient;
	private _user = signal<User | null>(null);
	loading = signal(true);

	get user(): User | null {
		return this._user();
	}
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

	updateUser = async ({
		newUsername,
		newPassword,
	}: {
		newUsername: string | null;
		newPassword: string | null;
	}): Promise<{ err: string | null }> => {
		return { err: null };
	};

	getAccounts = async (): Promise<Account[]> => {
		let { data, error } = await this.supabase.from('accounts').select('*, categories(*)');
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
				category: {
					id: acc.categories.id,
					name: acc.categories.name,
					color: acc.categories.color,
					icon: acc.categories.icon,
				} as Category,
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
}
