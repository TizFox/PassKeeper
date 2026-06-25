import { Component, input } from '@angular/core';
import { FormField, FieldState } from '@angular/forms/signals';

@Component({
	selector: 'app-select-input',
	templateUrl: './select-input.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [FormField],
})
export class SelectInput {
	label = input<string>('');
	optionList = input.required<string[]>();
	labelList = input<string[]>([]);
	extra = input<string>('');

	field = input.required<FieldState<string, string>>();

	protected getLabel(index: number): string {
		return this.labelList()[index] ?? this.optionList()[index];
	}
}
