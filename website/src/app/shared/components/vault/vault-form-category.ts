import { Component, inject, input, output, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { LucidePencil, LucideTrash, LucideX } from '@lucide/angular';

import { SupabaseService } from '$/core/supabase.service';
import { Category, CATEGORY_ICONS, DEFAULT_CATEGORY, FormType } from '$/core/types';

import { DashToTitlePipe } from '$/shared/pipes/dash-to-title.pipe';
import { Container } from '$/shared/components/base/container';
import { TextInput } from '$/shared/components/inputs/text-input';
import { SelectInput } from '$/shared/components/inputs/select-input';
import { Button } from '$/shared/components/inputs/button';
import { Value } from '$/shared/components/base/value';
import { VaultCategory } from '$/shared/components/vault/vault-category';

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
	protected supabase: SupabaseService = inject(SupabaseService);

	type = input.required<FormType>();
	modify = output<void>();
	close = output<void>();

	categoryId = input<string | null>(null);
	protected category = computed(
		() => this.supabase.categories()[this.categoryId() ?? ''] ?? DEFAULT_CATEGORY,
	);

	protected possibleIcons = Object.keys(CATEGORY_ICONS);

	protected categoryForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		icon: new FormControl('', [Validators.required]),
		color: new FormControl('#000', [Validators.required]),
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

	private readonly categoryFormValue = toSignal(this.categoryForm.valueChanges, {
		initialValue: this.categoryForm.getRawValue(),
	});
	protected readonly currentCategory = computed(() => {
		return {
			id: this.categoryId() ?? this.category()?.id,
			name: this.categoryFormValue().name,
			icon: this.categoryFormValue().icon,
			color: this.categoryFormValue().color,
		} as Category;
	});

	protected delete = async (): Promise<void> => {
		await this.supabase.delCategory(this.currentCategory());
		this.close.emit();
	};

	protected formSubmit = async (e: Event): Promise<void> => {
		e.preventDefault();

		if (!this.categoryForm.valid) {
			return;
		}

		console.log('CATEGORY FORM SUBMITTED:', this.currentCategory());

		switch (this.type()) {
			case 'new-category':
				await this.supabase.newCategory(this.currentCategory());
				console.log('categorie dopo new:', this.supabase.categoriesIds()); // cosa stampa?
				break;
			case 'modify-category':
				await this.supabase.modCategory(this.currentCategory());
				console.log('categorie dopo mod:', this.supabase.categoriesIds()); // cosa stampa?
				break;
		}

		this.close.emit();
	};
}
