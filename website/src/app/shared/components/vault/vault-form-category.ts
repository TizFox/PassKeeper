import {
	Component,
	inject,
	input,
	output,
	signal,
	computed,
	effect,
	ChangeDetectionStrategy,
} from '@angular/core';
import { FormRoot, FormField, form, required } from '@angular/forms/signals';

import { LucidePencil, LucideTrash2, LucideX } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { Category, CATEGORY_ICONS, DEFAULT_CATEGORY, FormType } from '$/core/types';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';
import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
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
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [
		FormRoot,
		FormField,
		LucidePencil,
		LucideTrash2,
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
	private supabase: SupabaseService = inject(SupabaseService);

	type = input.required<FormType>();
	modify = output<void>();
	delete = output<string>();
	close = output<void>();

	categoryId = input<string | null>(null);
	private category = computed<Category>(
		() => this.supabase.categories()[this.categoryId() ?? ''] ?? DEFAULT_CATEGORY,
	);

	protected possibleIcons = Object.keys(CATEGORY_ICONS);

	private categoryModel = signal<CategoryData>({
		name: '',
		icon: '',
		color: '#000',
	});
	protected categoryForm = form(this.categoryModel, (schema) => {
		required(schema.name);
		required(schema.icon);
		required(schema.color);
	});

	// Set Form Values to input Category
	constructor() {
		effect(() => {
			if (this.type() === 'view-category') {
				this.categoryModel.set({
					name: this.category()?.name ?? '',
					color: this.category()?.color ?? '',
					icon: this.category()?.icon ?? '',
				});
			}
		});
	}

	protected readonly currentCategory = computed<Category>(() => {
		return {
			id: this.categoryId() ?? this.category()?.id,
			name: this.categoryModel().name,
			icon: this.categoryModel().icon,
			color: this.categoryModel().color,
		} as Category;
	});

	protected formSubmit = async (e: Event): Promise<void> => {
		e.preventDefault();

		if (!this.categoryForm().valid()) {
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
