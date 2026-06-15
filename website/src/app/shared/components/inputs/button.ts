import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-button',
	templateUrl: './button.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [RouterLink],
})
export class Button {
	type = input<string>('button');
	onClick = output<Event>();
	disabled = input<boolean>(false);
	href = input<string | null>(null);
	extra = input<string>('');
	p = input<string>('px-3');

	protected handleClick = (e: Event) => {
		if (this.onClick) {
			this.onClick.emit(e);
		}
	};
}
