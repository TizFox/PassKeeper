import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Logo } from '$/shared/components/base/logo';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.html',
	styleUrl: './footer.css',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [Logo],
})
export class Footer {}
