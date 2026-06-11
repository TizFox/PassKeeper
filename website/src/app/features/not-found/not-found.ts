import { Component } from '@angular/core';

import { Empty } from '$/shared/components/status/empty';

@Component({
	selector: 'app-not-found',
	templateUrl: './not-found.html',
	imports: [Empty],
})
export class NotFound {}
