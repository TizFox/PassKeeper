import { Component } from '@angular/core';

import { Container } from '$/shared/components/container/container';

@Component({
	selector: 'app-popup',
	templateUrl: './popup.html',
	styleUrl: './popup.css',
	imports: [Container],
})
export class Popup {}
