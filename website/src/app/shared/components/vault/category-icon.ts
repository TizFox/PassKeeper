import { Component, input, booleanAttribute, computed } from '@angular/core';

import { LucideDynamicIcon } from '@lucide/angular';

import { Category, CATEGORY_ICONS } from '$/core/types';

@Component({
	selector: 'app-category-icon',
	templateUrl: './category-icon.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [LucideDynamicIcon],
})
export class CategoryIcon {
	category = input.required<Category>();
	simple = input(false, { transform: booleanAttribute });
	icon = computed(() => CATEGORY_ICONS[this.category().icon]);
}
