import { Component, input, computed } from '@angular/core';

import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';

import { TOAST_ICONS, PossibleToastIcons } from '$/core/types';

@Component({
	selector: 'app-toast',
	templateUrl: './toast.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [LucideDynamicIcon],
})
export class Toast {
	type = input.required<PossibleToastIcons>();
	title = input<string>('');
	message = input<string>('');

	icon = computed<LucideIcon>(() => TOAST_ICONS[this.type()]);
}
