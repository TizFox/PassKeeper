import { Component, inject, model, input, output, signal } from '@angular/core';
import { FormRoot, form, required, validate } from '@angular/forms/signals';

import { LucideX } from '@lucide/angular';

import { ToastService } from '$/core/toast.service';

import { getFormErrors } from '$/shared/utils/form-errors';

import { Container } from '$/shared/components/base/container';
import { Button } from '$/shared/components/inputs/button';
import { TextInput } from '$/shared/components/inputs/text-input';

@Component({
	selector: 'app-confirm',
	templateUrl: './confirm.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [FormRoot, LucideX, Container, Button, TextInput],
})
export class Confirm {
	private toast: ToastService = inject(ToastService);

	title = input.required<string>();
	message = input.required<string>();
	checkText = input<string | null>(null);
	close = output<boolean>();

	private checkModel = signal<{ text: string }>({ text: '' });
	protected checkForm = form(this.checkModel, (schema) => {
		required(schema.text, { message: 'Missing Text' });
		validate(schema.text, ({ value }) => {
			if (value().trim().toUpperCase() === this.checkText()!.trim().toUpperCase()) {
				return null;
			} else {
				return {
					kind: 'confirm',
					message: 'Invalid Text',
				};
			}
		});
	});

	protected formSubmit = (e: Event) => {
		e.preventDefault();

		this.checkForm().markAsTouched();
		if (this.checkText()) {
			if (this.checkForm().valid()) {
				this.close.emit(true);
			} else {
				this.toast.warning(
					'Invalid Confirm Info',
					getFormErrors(this.checkModel(), this.checkForm),
				);
			}
			return;
		}
		this.close.emit(false);
	};
}
