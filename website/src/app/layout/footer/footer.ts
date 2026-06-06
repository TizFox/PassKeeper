import { Component } from '@angular/core';

import { Logo } from '$/shared/components/base/logo';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.html',
	styleUrl: './footer.css',
	imports: [Logo],
})
export class Footer {}
