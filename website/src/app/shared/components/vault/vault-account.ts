import { Component, input, output } from '@angular/core';

import { Account } from '$/core/types';

import { Container } from '$/shared/components/base/container';
import { CategoryIcon } from '$/shared/components/vault/category-icon';

@Component({
	selector: 'app-vault-account',
	templateUrl: './vault-account.html',
	styles: `
		:host {
			display: contents;
		}
	`,
	imports: [Container, CategoryIcon],
})
export class VaultAccount {
	account = input.required<Account>();
	onClick = output();
}
