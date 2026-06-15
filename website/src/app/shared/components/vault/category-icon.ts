import {
	Component,
	input,
	booleanAttribute,
	computed,
	ChangeDetectionStrategy,
} from '@angular/core';

import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';

import { Category, CATEGORY_ICONS } from '$/core/types';

@Component({
	selector: 'app-category-icon',
	templateUrl: './category-icon.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [LucideDynamicIcon],
})
export class CategoryIcon {
	category = input.required<Category>();
	simple = input(false, { transform: booleanAttribute });
	icon = computed<LucideIcon>(() => CATEGORY_ICONS[this.category().icon]);
}
