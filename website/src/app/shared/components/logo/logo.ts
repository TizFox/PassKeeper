import { Component, input, booleanAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LucideLock } from '@lucide/angular';

@Component({
	selector: 'app-logo',
	templateUrl: './logo.html',
	styleUrl: './logo.css',
	imports: [RouterLink, LucideLock],
})
export class Logo {
	extended = input(false, { transform: booleanAttribute });
}
