import { Component, input, booleanAttribute, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'app-value',
	templateUrl: './value.html',
	changeDetection: ChangeDetectionStrategy.Eager,
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
