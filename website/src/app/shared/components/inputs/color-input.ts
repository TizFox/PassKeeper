import { Component, input } from '@angular/core';
import { FormField, FieldState } from '@angular/forms/signals';

@Component({
	selector: 'app-color-input',
	templateUrl: './color-input.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [FormField],
})
export class ColorInput {
	field = input.required<FieldState<string, string>>();
}
