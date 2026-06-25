import { Component, inject, input, output, signal, computed, linkedSignal } from '@angular/core';
import { FormRoot, form, required, validate } from '@angular/forms/signals';

import { LucidePencil, LucideTrash2, LucideX } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { ToastService } from '$/core/toast.service';
import {
	ICONS_NAMES,
	FormType,
	Category,
	JOLLY_CATEGORY_NAME,
	DEFAULT_CATEGORY,
} from '$/core/types';

import { getFormErrors } from '$/shared/utils/form-errors';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';
import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
import { ColorInput } from '$/shared/components/inputs/color-input';
import { Button } from '$/shared/components/inputs/button';
import { Value } from '$/shared/components/base/value';
import { CategoryRecord } from '$/shared/components/vault/category-record';
import { Confirm } from '$/shared/components/status/confirm';

interface CategoryData {
	name: string;
	icon: string;
	color: string;
}

@Component({
	selector: 'app-category-form',
	templateUrl: './category-form.html',
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
		CategoryRecord,
		Confirm,
	],
})
export class CategoryForm {
	private supabase: SupabaseService = inject(SupabaseService);
	private toast: ToastService = inject(ToastService);

	type = input.required<FormType>();
	modify = output<void>();
	delete = output<string>();
	close = output<void>();
	categoryId = input<string | null>(null);

	protected possibleIcons = ICONS_NAMES;

	private categoryModel = linkedSignal<CategoryData>(() => {
		const inputCategory: Category | undefined =
			this.supabase.categories()[this.categoryId() ?? ''];

		if (
			inputCategory &&
			(this.type() === 'view-category' || this.type() === 'modify-category')
		) {
			// Set Form Values to input Category
			return {
				name: inputCategory.name,
				icon: inputCategory.icon,
				color: inputCategory.color,
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
		validate(schema.name, ({ value }) => {
			const categoryNameBlacklist = (name: string) => {
				// All the invali category names:
				switch (name.toLowerCase()) {
					case JOLLY_CATEGORY_NAME.toLowerCase():
					case DEFAULT_CATEGORY.name.toLowerCase():
						return true;
					default:
						return false;
				}
			};

			if (categoryNameBlacklist(value())) {
				return {
					kind: 'blacklist',
					message: "A Category can't be named 'All' or 'Default'.",
				};
			}
			return null;
		});
	});

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
			this.toast.warning(
				'Invalid Category Info',
				getFormErrors(this.categoryModel(), this.categoryForm),
			);
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

	protected showConfirmDelete = signal<boolean>(false);
	protected closeConfirmDelete = (confirmed: boolean): void => {
		this.showConfirmDelete.set(false);

		if (!confirmed) {
			return;
		}

		this.delete.emit(this.currentCategory().id);
	};
}
