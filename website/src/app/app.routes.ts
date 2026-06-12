import { Route, Routes } from '@angular/router';

import { HomePage } from './features/home/home';
import { AuthPage } from './features/auth/auth';
import { VaultPage } from './features/vault/vault';
import { ProfilePage } from './features/profile/profile';
import { NotFoundPage } from './features/not-found/not-found';

export const routes: Routes = [
	{ path: '', component: HomePage },
	{ path: 'auth', component: AuthPage },
	{ path: 'vault', component: VaultPage },
	{ path: 'profile', component: ProfilePage },
	{ path: '**', component: NotFoundPage },
];

export type ValidRoute = { name: string; route: Route; show: boolean };
export const validRoutes: Array<ValidRoute> = routes
	.map((r: Route) => {
		let vr: ValidRoute = { name: '', route: r, show: true };

		if (!r.path) {
			vr.name = 'error';
			return vr;
		}

		vr.name = r.path[0].toUpperCase() + r.path.slice(1).toLowerCase();

		if (r.path === '' || r.path === 'profile' || r.path === '**') {
			vr.show = false;
		}

		return vr;
	})
	.filter((vr: ValidRoute) => vr.name !== 'error');
