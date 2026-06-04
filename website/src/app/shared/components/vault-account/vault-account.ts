import { Component, input } from '@angular/core';

import { Account } from '$/core/types';

import { Container } from '$/shared/components/container/container';

@Component({
	selector: 'app-vault-account',
	templateUrl: './vault-account.html',
	styleUrl: './vault-account.css',
	imports: [Container],
})
export class VaultAccount {
	item = input.required<Account>();
}
