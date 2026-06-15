import { Component, input, booleanAttribute, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'app-container',
	templateUrl: './container.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styles: `
		:host {
			display: contents;
		}
	`,
})
export class Container {
	popup = input(false, { transform: booleanAttribute });
	extra = input<string>('');
	bg = input<string>('bg-z1');
}
