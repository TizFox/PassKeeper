import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { SupabaseService } from '$/core/supabase.service';

import { Loading } from '$/shared/components/status/loading';

import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { Button } from '$/shared/components/inputs/button';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.html',
	imports: [ReactiveFormsModule, Loading, Container, TextInput, Button],
})
export class Auth {
	private router: Router = inject(Router);
	protected supabase: SupabaseService = inject(SupabaseService);
	constructor() {
		this.supabase.checkAuth(() => {
			this.router.navigate(['/vault']);
		});
	}

	protected loading = signal<boolean>(false);
	protected isLogin = signal<boolean>(true);
	protected translateLogin = computed<string>(() =>
		this.isLogin() ? 'translate-x-[50%]' : '-translate-x-[100vw]',
	);
	protected translateSignup = computed<string>(() =>
		this.isLogin() ? 'translate-x-[100vw]' : '-translate-x-[50%]',
	);

	protected switchForm = (): void => {
		this.isLogin.update((b: boolean) => !b);
	};

	protected loginForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	});
	protected signupForm = new FormGroup({
		username: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	});

	protected handler = async (e: Event, type: string): Promise<void> => {
		e.preventDefault();

		let success = false;

		this.loading.set(true);
		switch (type) {
			case 'login':
				success = await this.handleLogin();
				break;
			case 'signup':
				success = await this.handleSignup();
				break;
		}
		this.loading.set(false);

		if (success) {
			this.router.navigate(['/vault']);
		}
	};

	private handleLogin = async (): Promise<boolean> => {
		if (!this.loginForm.valid) {
			console.log('INVALID LOGIN');
			return false;
		}

		// Supabase Login
		let { user, err } = await this.supabase.login(
			this.loginForm.value.email!,
			this.loginForm.value.password!,
		);
		if (err || !user) {
			console.log(err);
			return false;
		}
		return true;
	};
	private handleSignup = async (): Promise<boolean> => {
		if (!this.signupForm.valid) {
			console.log('INVALID SIGNUP');
			return false;
		}

		// Supabase Signup
		let { user, err } = await this.supabase.signup(
			this.signupForm.value.username!,
			this.signupForm.value.email!,
			this.signupForm.value.password!,
		);
		if (err || !user) {
			console.log(err);
			return false;
		}
		return true;
	};
}
