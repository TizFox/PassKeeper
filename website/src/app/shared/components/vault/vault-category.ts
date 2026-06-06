import { Component, input, output } from '@angular/core';

import { Category } from '$/core/types';

import { CategoryIcon } from '$/shared/components/vault/category-icon';

@Component({
	selector: 'app-vault-category',
	templateUrl: './vault-category.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [CategoryIcon],
})
export class VaultCategory {
	category = input.required<Category>();
	onClick = output();
}
