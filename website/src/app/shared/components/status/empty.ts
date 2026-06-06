import { Component, input } from '@angular/core';

import { LucideFrown } from '@lucide/angular';

@Component({
	selector: 'app-empty',
	templateUrl: './empty.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [LucideFrown],
})
export class Empty {
	msg = input.required<string>();
}
