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
	LucideTextCursorInput,
	LucideMail,
	LucideLockKeyhole,
	LucideEye,
	LucideEyeOff,
} from '@lucide/angular';

@Component({
	selector: 'app-text-input',
	templateUrl: './text-input.html',
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
	type = input('text');
	placeholder = input('');
	required = input(false, { transform: booleanAttribute });
	invalidIf = input(false);
	notObscured = input(false, { transform: booleanAttribute });

	protected value = signal('');
	protected disabled = signal(false);

	protected icon = computed(() => {
		switch (this.type()) {
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

	protected obscured = linkedSignal(() => !this.notObscured);
	protected passIcon = computed(() => (this.obscured() ? LucideEye : LucideEyeOff));
	protected toggleObscured = () => {
		this.obscured.set(!this.obscured());
	};

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
