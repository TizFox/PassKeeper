import { Component, input, booleanAttribute, computed, linkedSignal } from '@angular/core';
import { FormField, FieldState } from '@angular/forms/signals';

import {
	LucideDynamicIcon,
	LucideIcon,
	LucideSearch,
	LucideTextCursorInput,
	LucideMail,
	LucideLockKeyhole,
	LucideEye,
	LucideEyeOff,
} from '@lucide/angular';

@Component({
	selector: 'app-text-input',
	templateUrl: './text-input.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [FormField, LucideDynamicIcon],
})
export class TextInput {
	type = input<string>('text');
	placeholder = input<string>('');
	extra = input<string>('');
	notObscured = input(false, { transform: booleanAttribute });

	field = input.required<FieldState<string, string>>();
	protected invalid = computed<boolean>(() => {
		return this.field().touched() && this.field().invalid();
	});

	protected obscured = linkedSignal<boolean>(() => !this.notObscured());
	protected passIcon = computed<LucideIcon>(() => (this.obscured() ? LucideEye : LucideEyeOff));
	protected toggleObscured = () => {
		this.obscured.update((old) => !old);
	};

	protected inputType = computed<string>(() => {
		if (this.type() === 'search' || (this.type() === 'password' && !this.obscured())) {
			return 'text';
		}
		return this.type();
	});

	protected icon = computed<LucideIcon>(() => {
		switch (this.type()) {
			case 'search':
				return LucideSearch;
			case 'text':
				return LucideTextCursorInput;
			case 'email':
				return LucideMail;
			case 'password':
				return LucideLockKeyhole;
			default:
				return LucideTextCursorInput;
		}
	});
}
