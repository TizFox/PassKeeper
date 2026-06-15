import { Component, input, booleanAttribute, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LucideLock } from '@lucide/angular';

@Component({
	selector: 'app-logo',
	templateUrl: './logo.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [RouterLink, LucideLock],
})
export class Logo {
	extended = input(false, { transform: booleanAttribute });
}
