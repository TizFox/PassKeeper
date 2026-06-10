import {
	LucideIcon,
	LucideDatabase,
	LucideAsterisk,
	LucideBanknote,
	LucidePizza,
} from '@lucide/angular';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
	default: LucideDatabase,
	general: LucideAsterisk,
	finance: LucideBanknote,
	food: LucidePizza,
};

export type Profile = {
	email: string;
	createdAt: string;
	username: string;
};

export type Account = {
	id: string;
	name: string;
	username: string;
	password: string;
	notes?: string;
	categoryId: string;
};

export type Category = {
	id: string;
	name: string;
	icon: keyof typeof CATEGORY_ICONS;
	color: string;
};
export const DEFAULT_CATEGORY: Category = {
	id: '0000-0000-0000-0000',
	name: 'Default',
	icon: 'default',
	color: '#000',
};

export type FormType =
	| 'no-form'
	| 'new-account'
	| 'view-account'
	| 'modify-account'
	| 'new-category'
	| 'view-category'
	| 'modify-category';
