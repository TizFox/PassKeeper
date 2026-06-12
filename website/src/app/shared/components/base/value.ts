import { Component, input, booleanAttribute } from '@angular/core';

@Component({
	selector: 'app-value',
	templateUrl: './value.html',
	styles: `
		:host {
			display: contents;
		}
	`,
})
export class Value {
	bgColor = input<string>('');
	multiline = input(false, { transform: booleanAttribute });
}
