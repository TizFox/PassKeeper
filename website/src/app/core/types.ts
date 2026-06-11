import {
	LucideIcon,
	LucideDatabase,
	LucideSquareAsterisk,
	LucideBanknote,
	LucidePizza,
	LucidePartyPopper,
	LucideBriefcaseBusiness,
	LucideSmartphone,
	LucideLaptop,
} from '@lucide/angular';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
	default: LucideDatabase,
	general: LucideSquareAsterisk,
	finance: LucideBanknote,
	food: LucidePizza,
	fun: LucidePartyPopper,
	work: LucideBriefcaseBusiness,
	phone: LucideSmartphone,
	computer: LucideLaptop,
};

export type Profile = {
	email: string;
	createdAt: string;
	username: string;
};

export type Account = {
	id: string;
	name: string;
	username?: string;
	email?: string;
	password?: string;
	notes?: string;
	category_id: string;
};

export type Category = {
	id: string;
	name: string;
	icon: keyof typeof CATEGORY_ICONS;
	color: string;
};
export const DEFAULT_CATEGORY = {
	id: null,
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
