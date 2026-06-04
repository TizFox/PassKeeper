import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-button',
	templateUrl: './button.html',
	styleUrl: './button.css',
	imports: [RouterLink],
})
export class Button {
	type = input('button');
	onClick = output<Event>();
	class = input('');
	p = input('px-3 py-1');
	disabled = input(false);
	href = input<string | null>(null);

	protected handleClick = (e: Event) => {
		if (this.onClick) {
			this.onClick.emit(e);
		}
	};
}
