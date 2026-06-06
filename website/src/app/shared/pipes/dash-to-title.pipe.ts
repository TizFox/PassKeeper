import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'dashtotitle',
})
export class DashToTitlePipe implements PipeTransform {
	transform(dashed: string): string {
		return dashed
			.split('-')
			.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
			.join(' ');
	}
}
