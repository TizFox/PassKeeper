import { Component, input, booleanAttribute } from '@angular/core';

@Component({
	selector: 'app-container',
	templateUrl: './container.html',
	styles: `
		:host {
			display: contents;
		}
	`,
})
export class Container {
	popup = input(false, { transform: booleanAttribute });
	extra = input('');
	bg = input('bg-z1');
}
