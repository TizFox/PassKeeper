import { Component } from '@angular/core';

import { Loading } from '$/shared/components/status/loading';

@Component({
	selector: 'app-home',
	templateUrl: './home.html',
	imports: [Loading],
})
export class Home {}
