import {
	Component,
	inject,
	input,
	output,
	computed,
	effect,
	ChangeDetectionStrategy,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

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
		ReactiveFormsModule,
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

	protected categoryForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		icon: new FormControl('', [Validators.required]),
		color: new FormControl('#000', [Validators.required]),
	});

	// Set Form Values to input Category
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

	// Get dynamic Account object with Form Values
	protected readonly categoryFormValue = toSignal(this.categoryForm.valueChanges, {
		initialValue: this.categoryForm.getRawValue(),
	});
	protected readonly currentCategory = computed<Category>(() => {
		return {
			id: this.categoryId() ?? this.category()?.id,
			name: this.categoryFormValue().name,
			icon: this.categoryFormValue().icon,
			color: this.categoryFormValue().color,
		} as Category;
	});

	protected formSubmit = async (e: Event): Promise<void> => {
		e.preventDefault();

		if (!this.categoryForm.valid) {
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
