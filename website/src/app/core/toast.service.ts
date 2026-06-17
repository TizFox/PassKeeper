import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

import { Toast } from '$/shared/components/base/toast';

@Injectable({
	providedIn: 'root',
})
export class ToastService {
	info = (t?: string, m?: string) => {
		toast.custom(Toast, {
			componentProps: {
				type: 'info',
				title: t,
				message: m,
			},
		});
	};
	success = (t?: string, m?: string) => {
		toast.custom(Toast, {
			componentProps: {
				type: 'success',
				title: t,
				message: m,
			},
		});
	};
	warning = (t?: string, m?: string) => {
		toast.custom(Toast, {
			componentProps: {
				type: 'warning',
				title: t,
				message: m,
			},
		});
	};
	error = (t?: string, m?: string) => {
		toast.custom(Toast, {
			componentProps: {
				type: 'error',
				title: t,
				message: m,
			},
		});
	};
}
