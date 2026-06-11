import { Route, Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Auth } from './features/auth/auth';
import { Vault } from './features/vault/vault';
import { Profile } from './features/profile/profile';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'auth', component: Auth },
	{ path: 'vault', component: Vault },
	{ path: 'profile', component: Profile },
	{ path: '**', component: NotFound },
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
