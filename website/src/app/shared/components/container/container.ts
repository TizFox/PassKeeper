import { Component, input } from '@angular/core';

@Component({
	selector: 'app-container',
	templateUrl: './container.html',
	styleUrl: './container.css',
})
export class Container {
	class = input('');
	bg = input('bg-z1');
}
