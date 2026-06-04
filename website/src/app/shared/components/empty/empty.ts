import { Component, input } from '@angular/core';

import { LucideFrown } from '@lucide/angular';

@Component({
	selector: 'app-empty',
	templateUrl: './empty.html',
	styleUrl: './empty.css',
	imports: [LucideFrown],
})
export class Empty {
	msg = input.required<string>();
}
