import {
	Component,
	forwardRef,
	input,
	booleanAttribute,
	signal,
	computed,
	linkedSignal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TextInput),
			multi: true,
		},
	],
	imports: [LucideDynamicIcon],
})
export class TextInput implements ControlValueAccessor {
	type = input<string>('text');
	placeholder = input<string>('');
	extra = input<string>('');
	notObscured = input(false, { transform: booleanAttribute });
	required = input(false, { transform: booleanAttribute });

	protected value = signal<string>('');
	protected disabled = signal<boolean>(false);

	protected obscured = linkedSignal<boolean>(() => !this.notObscured());
	protected passIcon = computed<LucideIcon>(() => (this.obscured() ? LucideEye : LucideEyeOff));
	protected toggleObscured = () => {
		this.obscured.update((old) => !old);
	};

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

	protected onChange: (v: string) => void = () => {};
	protected onTouched: () => void = () => {};

	writeValue = (value: string): void => {
		this.value.set(value ?? '');
	};
	registerOnChange = (fn: (v: string) => void): void => {
		this.onChange = fn;
	};
	registerOnTouched = (fn: () => void): void => {
		this.onTouched = fn;
	};
	setDisabledState = (isDisabled: boolean): void => {
		this.disabled.set(isDisabled);
	};
	protected onInput = (e: Event): void => {
		const val = (e.target as HTMLInputElement).value;
		this.value.set(val);
		this.onChange(val);
	};
	protected onBlur = (): void => {
		this.onTouched();
	};
}
