import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormRoot, form, required, email, minLength } from '@angular/forms/signals';

import { SupabaseService, MIN_PASSWORD_LENGTH } from '$/core/supabase.service';
import { ToastService } from '$/core/toast.service';

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
	imports: [FormRoot, Loading, Container, TextInput, Button],
})
export class AuthPage {
	private router: Router = inject(Router);
	private supabase: SupabaseService = inject(SupabaseService);
	private toast: ToastService = inject(ToastService);
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
		required(schema.email, { message: 'Missing Email' });
		email(schema.email, { message: 'Invalid Email' });
		required(schema.password, { message: 'Missing Password' });
		minLength(schema.password, MIN_PASSWORD_LENGTH, { message: 'Invalid Password' });
	});
	private loginFormErrors = computed<string>(() =>
		Object.keys(this.loginModel())
			.flatMap((field) => (this.loginForm as any)[field]().errors())
			.map((err) => err.message)
			.join(', '),
	);

	private signupModel = signal<SignupData>({ username: '', email: '', password: '' });
	protected signupForm = form(this.signupModel, (schema) => {
		required(schema.username, { message: 'Missing Username' });
		required(schema.email, { message: 'Missing Email' });
		email(schema.email, { message: 'Invalid Email' });
		required(schema.password, { message: 'Missing Password' });
		minLength(schema.password, MIN_PASSWORD_LENGTH, { message: 'Invalid Password' });
	});
	private signupFormErrors = computed<string>(() =>
		Object.keys(this.signupModel())
			.flatMap((field) => (this.signupForm as any)[field]().errors())
			.map((err) => err.message)
			.join(', '),
	);

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
		this.loginForm().markAsTouched();
		if (this.loginForm().invalid()) {
			/*
			const errors = [...this.loginForm.email().errors(), ...this.loginForm.email().errors()]
				.map((err) => err.message)
				.join(', ');
			*/
			this.toast.warning('Invalid Login Info', this.loginFormErrors());
			return false;
		}

		// Supabase Login
		const err = await this.supabase.login(this.loginModel().email, this.loginModel().password);

		if (err) {
			this.toast.error("Can't login in this Account", err);
			console.log(err);
			return false;
		}
		return true;
	};
	private handleSignup = async (): Promise<boolean> => {
		this.signupForm().markAsTouched();
		if (this.signupForm().invalid()) {
			console.log(this.signupForm().errors());
			this.toast.warning('Invalid Signup Info', this.signupFormErrors());
			return false;
		}

		// Supabase Signup
		const err = await this.supabase.signup(
			this.signupModel().username,
			this.signupModel().email,
			this.signupModel().password,
		);
		if (err) {
			this.toast.error("Can't signup a new Account", err);
			console.log(err);
			return false;
		}
		return true;
	};
}
