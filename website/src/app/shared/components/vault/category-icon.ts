import { Component, input, booleanAttribute, computed } from '@angular/core';

import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';

import { CATEGORY_ICONS, Category } from '$/core/types';

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
	icon = computed<LucideIcon>(() => CATEGORY_ICONS[this.category().icon]);
}
