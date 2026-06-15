import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { LucideLoaderCircle } from '@lucide/angular';

@Component({
	selector: 'app-loading',
	templateUrl: './loading.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [LucideLoaderCircle],
})
export class Loading {
	msg = input<string>('');
	w = input<string>('w-full');
}
