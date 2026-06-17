import { Component, inject, input, output, computed, linkedSignal } from '@angular/core';
import { FormRoot, form, required } from '@angular/forms/signals';

import { LucidePencil, LucideTrash2, LucideX } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { ToastService } from '$/core/toast.service';
import { ICONS_NAMES, FormType, Category, DEFAULT_CATEGORY } from '$/core/types';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';
import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
import { ColorInput } from '$/shared/components/inputs/color-input';
import { Button } from '$/shared/components/inputs/button';
import { Value } from '$/shared/components/base/value';
import { VaultCategory } from '$/shared/components/vault/vault-category';

interface CategoryData {
	name: string;
	icon: string;
	color: string;
}

@Component({
	selector: 'app-vault-form-category',
	templateUrl: './vault-form-category.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [
		FormRoot,
		LucidePencil,
		LucideTrash2,
		LucideX,
		DashToTitlePipe,
		Container,
		TextInput,
		SelectInput,
		ColorInput,
		Button,
		Value,
		VaultCategory,
	],
})
export class VaultFormCategory {
	private supabase: SupabaseService = inject(SupabaseService);
	private toast: ToastService = inject(ToastService);

	type = input.required<FormType>();
	modify = output<void>();
	delete = output<string>();
	close = output<void>();

	categoryId = input<string | null>(null);
	private category = computed<Category | undefined>(
		() => this.supabase.categories()[this.categoryId() ?? ''] ?? DEFAULT_CATEGORY,
	);
	protected possibleIcons = ICONS_NAMES;

	private categoryModel = linkedSignal<CategoryData>(() => {
		if (
			this.category() &&
			(this.type() === 'view-category' || this.type() === 'modify-category')
		) {
			// Set Form Values to input Category
			return {
				name: this.category()?.name,
				icon: this.category()?.icon,
				color: this.category()?.color,
			} as CategoryData;
		}

		return {
			name: '',
			icon: this.possibleIcons[0],
			color: '#000',
		} as CategoryData;
	});
	protected categoryForm = form(this.categoryModel, (schema) => {
		required(schema.name, { message: 'Missing Category Name' });
	});
	private categoryFormErrors = computed<string>(() =>
		Object.keys(this.categoryModel())
			.flatMap((field) => (this.categoryForm as any)[field]().errors())
			.map((err) => err.message)
			.join(', '),
	);

	protected readonly currentCategory = computed<Category>(() => {
		return {
			id: this.categoryId(),
			name: this.categoryModel().name,
			icon: this.categoryModel().icon,
			color: this.categoryModel().color,
		} as Category;
	});

	protected formSubmit = async (e: Event): Promise<void> => {
		e.preventDefault();

		this.categoryForm().markAsTouched();
		if (this.categoryForm().invalid()) {
			this.toast.warning('Invalid Category Info', this.categoryFormErrors());
			return;
		}

		console.log(this.type(), '- FORM SUBMITTED:', this.currentCategory());

		switch (this.type()) {
			case 'new-category':
				await this.supabase.newCategory(this.currentCategory());
				break;
			case 'modify-category':
				await this.supabase.modCategory(this.currentCategory());
				break;
		}

		this.close.emit();
	};
}
