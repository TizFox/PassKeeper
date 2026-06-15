import {
	Component,
	forwardRef,
	input,
	signal,
	effect,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';

@Component({
	selector: 'app-select-input',
	templateUrl: './select-input.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SelectInput),
			multi: true,
		},
	],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [DashToTitlePipe],
})
export class SelectInput implements ControlValueAccessor {
	label = input<string>('');
	optionList = input.required<string[]>();
	extra = input<string>('');

	protected value = signal<string>('');

	constructor() {
		effect(() => {
			if (this.optionList().length > 0 && this.value() === '') {
				this.value.set(this.optionList()[0]);
				this.onChange(this.optionList()[0]);
			}
		});
	}

	protected onSelect(e: Event): void {
		const selected = (e.target as HTMLSelectElement).value;
		this.value.set(selected);
		this.onChange(selected);
		this.onTouched();
	}

	private onChange: (v: string) => void = () => {};
	private onTouched: () => void = () => {};

	writeValue(v: string): void {
		this.value.set(v ?? '');
	}

	registerOnChange(fn: (v: string) => void): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}
}
