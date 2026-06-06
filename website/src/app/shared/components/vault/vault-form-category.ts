import { Component, input, output, computed, effect, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { LucidePencil, LucideTrash, LucideX } from '@lucide/angular';

import { Category, CATEGORY_ICONS, FormType } from '$/core/types';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';
import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
import { Button } from '$/shared/components/inputs/button';
import { Value } from '$/shared/components/base/value';
import { VaultCategory } from './vault-category';

@Component({
	selector: 'app-vault-form-category',
	templateUrl: './vault-form-category.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [
		ReactiveFormsModule,
		LucidePencil,
		LucideTrash,
		LucideX,
		DashToTitlePipe,
		Container,
		TextInput,
		SelectInput,
		Button,
		Value,
		VaultCategory,
	],
})
export class VaultFormCategory {
	typeInput = input.required<FormType>();
	type = linkedSignal(() => this.typeInput());
	categories = input.required<Category[]>();
	close = output<void>();

	category = input<Category | null>();
	createCategory = output<Category>();
	updateCategory = output<Category>();
	deleteCategory = output<Category>();

	protected possibleIcons = Object.keys(CATEGORY_ICONS);

	protected categoryForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		icon: new FormControl('', [Validators.required]),
		color: new FormControl('#000', [Validators.required]),
	});

	private readonly categoryFormValue = toSignal(this.categoryForm.valueChanges, {
		initialValue: this.categoryForm.getRawValue(),
	});
	protected readonly currentCategory = computed(() => {
		return {
			id: this.category()?.id,
			name: this.categoryFormValue().name,
			icon: this.categoryFormValue().icon,
			color: this.categoryFormValue().color,
		} as Category;
	});

	constructor() {
		effect(() => {
			if (this.type() === 'view-category') {
				this.categoryForm.patchValue({
					name: this.category()?.name ?? '',
					color: this.category()?.color ?? '',
					icon: this.category()?.icon ?? '',
				});
			}
		});
	}

	protected modify = (): void => {
		this.type.set('modify-category');
	};
	protected delete = (): void => {
		this.deleteCategory.emit(this.currentCategory());
		this.close.emit();
	};

	protected formSubmit = (e: Event): void => {
		e.preventDefault();

		if (!this.categoryForm.valid) {
			return;
		}

		console.log('CATEGORY FORM SUBMITTED:', this.currentCategory());

		switch (this.type()) {
			case 'new-category':
				this.createCategory.emit(this.currentCategory());
				break;
			case 'modify-category':
				this.updateCategory.emit(this.currentCategory());
				break;
			default:
				break;
		}

		this.close.emit();
	};
}
