import { Component, input } from '@angular/core';
import { FormField, FieldState } from '@angular/forms/signals';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';

@Component({
	selector: 'app-select-input',
	templateUrl: './select-input.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [FormField, DashToTitlePipe],
})
export class SelectInput {
	label = input<string>('');
	optionList = input.required<string[]>();
	extra = input<string>('');

	field = input.required<FieldState<string, string>>();
}
