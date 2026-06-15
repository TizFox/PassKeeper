import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormRoot, FormField, form, minLength } from '@angular/forms/signals';

import { SupabaseService } from '$/core/supabase.service';
import { Profile } from '$/core/types';

import { Loading } from '$/shared/components/status/loading';

import { Container } from '$/shared/components/base/container';
import { Avatar } from '$/shared/components/base/avatar';
import { TextInput } from '$/shared/components/inputs/text-input';
import { Button } from '$/shared/components/inputs/button';

interface ProfileData {
	newUsername: string;
	newPassword: string;
}

type ProfileActions = 'update' | 'logout' | 'delete';

@Component({
	selector: 'app-profile-page',
	templateUrl: './profile.html',
	imports: [FormRoot, FormField, Loading, Container, Avatar, TextInput, Button],
})
export class ProfilePage {
	private router: Router = inject(Router);
	private supabase: SupabaseService = inject(SupabaseService);
	constructor() {
		this.supabase.checkAuth({});
	}

	protected setup = computed<boolean>(() => this.supabase.loading());
	protected profile = computed<Profile>(() => this.supabase.profile());

	protected loading = signal<boolean>(false);

	private profileModel = signal<ProfileData>({
		newUsername: '',
		newPassword: '',
	});
	protected profileForm = form(this.profileModel, (schema) => {
		minLength(schema.newPassword, 6);
	});

	protected handler = async (type: ProfileActions): Promise<void> => {
		this.loading.set(true);

		switch (type) {
			case 'update':
				this.handleUpdate();
				break;
			case 'logout':
				this.handleLogout();
				break;
			case 'delete':
				this.handleDeleteAccount();
				break;
		}

		this.loading.set(false);
	};

	private handleUpdate = async (): Promise<void> => {
		if (this.profileModel().newUsername === '' && this.profileModel().newPassword === '') {
			return;
		}

		const err = await this.supabase.updateProfile({
			newUsername: this.profileModel().newUsername ?? null,
			newPassword: this.profileModel().newPassword ?? null,
		});
		if (err) {
			console.log(err);
			return;
		}

		this.profileModel.set({ newUsername: '', newPassword: '' });
	};
	private handleLogout = async (): Promise<void> => {
		let err = await this.supabase.logout();
		if (err) {
			console.log(err);
			return;
		}
		this.router.navigate(['/']);
	};
	private handleDeleteAccount = async (): Promise<void> => {
		//...
		console.log('DELETE USER:', this.supabase.user?.id);
		this.router.navigate(['/']);
	};
}
