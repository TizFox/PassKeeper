import { Component, signal } from '@angular/core';

import { Header } from '$/layout/header';
import { MainLayout } from '$/layout/main-layout';
import { Footer } from '$/layout/footer';

import { AuthPage } from '$/features/auth';
import { VaultPage } from '$/features/vault';

type View = 'auth' | 'vault';

@Component({
	selector: 'app-popup',
	templateUrl: './popup.html',
	imports: [Header, MainLayout, Footer, AuthPage, VaultPage],
})
export class Popup {
	protected view = signal<View>('auth');

	protected openSite = () => {
		console.log('tizfox.github.io/PassKeeper/auth');
	};
}
