import { Component, forwardRef, input, booleanAttribute, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'app-area-input',
	templateUrl: './area-input.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AreaInput),
			multi: true,
		},
	],
})
export class AreaInput implements ControlValueAccessor {
	placeholder = input<string>('');
	required = input(false, { transform: booleanAttribute });

	protected value = signal<string>('');
	protected disabled = signal<boolean>(false);

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
