import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormRoot, form, minLength } from '@angular/forms/signals';

import { SupabaseService, MIN_PASSWORD_LENGTH } from '$/core/supabase.service';
import { ToastService } from '$/core/toast.service';
import { Profile } from '$/core/types';

import { Loading } from '$/shared/components/status/loading';

import { Confirm } from '$/shared/components/status/confirm';
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
	imports: [FormRoot, Loading, Confirm, Container, Avatar, TextInput, Button],
})
export class ProfilePage {
	private router: Router = inject(Router);
	private supabase: SupabaseService = inject(SupabaseService);
	private toast: ToastService = inject(ToastService);
	constructor() {
		this.supabase.checkAuth({});
	}

	protected setup = computed<boolean>(() => this.supabase.loading());
	protected profile = computed<Profile>(() => this.supabase.profile());

	protected loading = signal<boolean>(false);
	protected showConfirmDelete = signal<boolean>(false);

	private profileModel = signal<ProfileData>({
		newUsername: '',
		newPassword: '',
	});
	protected profileForm = form(this.profileModel, (schema) => {
		minLength(schema.newPassword, MIN_PASSWORD_LENGTH);
	});

	protected handler = async (type: ProfileActions, confirmed: boolean = false): Promise<void> => {
		this.loading.set(true);

		switch (type) {
			case 'update':
				await this.handleUpdate();
				break;
			case 'logout':
				await this.handleLogout();
				break;
			case 'delete':
				await this.handleDeleteAccount(confirmed);
				break;
		}

		this.loading.set(false);
	};

	private handleUpdate = async (): Promise<void> => {
		if (this.profileModel().newUsername === '' && this.profileModel().newPassword === '') {
			this.toast.warning('Missing New Info');
			return;
		}

		const err = await this.supabase.updateProfile({
			newUsername: this.profileModel().newUsername ?? null,
			newPassword: this.profileModel().newPassword ?? null,
		});
		if (err) {
			this.toast.error("Can't update your Profile", err);
			console.log(err);
			return;
		}
		this.toast.success('Profile updated successfully');

		this.profileModel.set({ newUsername: '', newPassword: '' });
	};
	private handleLogout = async (): Promise<void> => {
		const err = await this.supabase.logout();
		if (err) {
			this.toast.error("Can't logout from your Account", err);
			console.log(err);
			return;
		}
		this.router.navigate(['/']);
	};
	private handleDeleteAccount = async (confirmed: boolean): Promise<void> => {
		this.showConfirmDelete.set(false);

		if (!confirmed) {
			return;
		}

		const err = await this.supabase.deleteUser();
		if (err) {
			this.toast.error("Can't delete your Account", err);
			console.log(err);
			return;
		}
		this.toast.info('Account deleted successfully');
		window.location.href = '/'; // Reloads the page
	};
}
