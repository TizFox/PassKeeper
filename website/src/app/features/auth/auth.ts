import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormRoot, FormField, form, required, email, minLength } from '@angular/forms/signals';

import { SupabaseService } from '$/core/supabase.service';

import { Loading } from '$/shared/components/status/loading';

import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { Button } from '$/shared/components/inputs/button';

interface LoginData {
	email: string;
	password: string;
}
interface SignupData {
	username: string;
	email: string;
	password: string;
}

type AuthActions = 'login' | 'signup';

@Component({
	selector: 'app-auth-page',
	templateUrl: './auth.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [FormRoot, FormField, Loading, Container, TextInput, Button],
})
export class AuthPage {
	private router: Router = inject(Router);
	private supabase: SupabaseService = inject(SupabaseService);
	constructor() {
		this.supabase.checkAuth({
			success: () => {
				this.router.navigate(['/vault']);
			},
			failure: () => {},
		});
	}

	protected setup = computed<boolean>(() => this.supabase.loading());
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

	private loginModel = signal<LoginData>({ email: '', password: '' });
	protected loginForm = form(this.loginModel, (schema) => {
		required(schema.email);
		email(schema.email);
		required(schema.password);
		minLength(schema.password, 6);
	});

	private signupModel = signal<SignupData>({ username: '', email: '', password: '' });
	protected signupForm = form(this.signupModel, (schema) => {
		required(schema.username);
		required(schema.email);
		email(schema.email);
		required(schema.password);
		minLength(schema.password, 6);
	});

	protected handler = async (e: Event, type: AuthActions): Promise<void> => {
		e.preventDefault();

		this.loading.set(true);

		let success = false;
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
		if (!this.loginForm().valid()) {
			console.log('INVALID LOGIN');
			return false;
		}

		// Supabase Login
		const err = await this.supabase.login(this.loginModel().email, this.loginModel().password);

		if (err) {
			console.log(err);
			return false;
		}
		return true;
	};
	private handleSignup = async (): Promise<boolean> => {
		if (!this.signupForm().valid()) {
			console.log('INVALID SIGNUP');
			return false;
		}

		// Supabase Signup
		const err = await this.supabase.signup(
			this.signupModel().username,
			this.signupModel().email,
			this.signupModel().password,
		);
		if (err) {
			console.log(err);
			return false;
		}
		return true;
	};
}
