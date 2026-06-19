import { Component, input, output } from '@angular/core';

import { Category } from '$/core/types';

import { CategoryIcon } from '$/shared/components/vault/category-icon';

@Component({
	selector: 'app-category-record',
	templateUrl: './category-record.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [CategoryIcon],
})
export class CategoryRecord {
	category = input.required<Category>();
	onClick = output<void>();
}
