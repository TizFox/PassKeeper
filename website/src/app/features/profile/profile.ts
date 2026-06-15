import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

import { SupabaseService } from '$/core/supabase.service';
import { Profile } from '$/core/types';

import { Loading } from '$/shared/components/status/loading';

import { Container } from '$/shared/components/base/container';
import { Avatar } from '$/shared/components/base/avatar';
import { TextInput } from '$/shared/components/inputs/text-input';
import { Button } from '$/shared/components/inputs/button';

@Component({
	selector: 'app-profile-page',
	templateUrl: './profile.html',
	imports: [ReactiveFormsModule, Loading, Container, Avatar, TextInput, Button],
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

	protected profileForm = new FormGroup({
		newUsername: new FormControl(''),
		newPassword: new FormControl(''),
		// newUsername: field(''),
		// newPassword: field(''),
	});

	protected handler = async (e: Event, type: string): Promise<void> => {
		e.preventDefault();

		this.loading.set(true);
		switch (type) {
			case 'update':
				await this.handleUpdate();
				break;
			case 'logout':
				await this.handleLogout();
				break;
			case 'delete':
				await this.handleDeleteAccount();
				break;
		}
		this.loading.set(false);
	};

	private handleUpdate = async (): Promise<boolean> => {
		if (
			this.profileForm.value.newUsername === '' &&
			this.profileForm.value.newPassword === ''
		) {
			return false;
		}

		const err = await this.supabase.updateProfile({
			newUsername: this.profileForm.value.newUsername ?? null,
			newPassword: this.profileForm.value.newPassword ?? null,
		});
		if (err) {
			console.log(err);
			return false;
		}

		this.profileForm.reset();

		return true;
	};
	private handleLogout = async (): Promise<boolean> => {
		let err = await this.supabase.logout();
		if (err) {
			console.log(err);
			return false;
		}
		this.router.navigate(['/']);
		return true;
	};
	private handleDeleteAccount = async (): Promise<boolean> => {
		// ...
		this.router.navigate(['/']);
		return true;
	};
}
