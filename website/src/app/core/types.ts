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
	LucideLayers,
	LucideHospital,
	LucideInfo,
	LucideSquareCheckBig,
	LucideTriangleAlert,
	LucideOctagonX,
	LucideSkull,
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
	documents: LucideLayers,
	health: LucideHospital,
} as const;
type PossibleCategoryIcons = keyof typeof CATEGORY_ICONS;
export const ICONS_NAMES: PossibleCategoryIcons[] = Object.keys(CATEGORY_ICONS);

export const TOAST_ICONS: Record<string, LucideIcon> = {
	info: LucideInfo,
	success: LucideSquareCheckBig,
	warning: LucideTriangleAlert,
	error: LucideOctagonX,
} as const;
export type PossibleToastIcons = keyof typeof TOAST_ICONS;

/* -------------------------------------------------------------- */

export type FormType =
	| 'no-form'
	| 'new-account'
	| 'view-account'
	| 'modify-account'
	| 'new-category'
	| 'view-category'
	| 'modify-category';

export type Profile = {
	email: string;
	createdAt: string;
	username: string;
};
export type SupabaseAccount = {
	id: string;
	name: string;
	username?: string;
	email?: string;
	notes?: string;
	password?: string;
	iv?: string;
	tag?: string;
	category_id: string;
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
export type EncryptedPassword = {
	password: string;
	iv: string;
	tag: string;
};
export type Category = {
	id: string;
	name: string;
	icon: PossibleCategoryIcons;
	color: string;
};

export const JOLLY_CATEGORY_NAME = 'All';
export const DEFAULT_CATEGORY: Category = {
	id: '',
	name: 'Default',
	icon: 'default',
	color: '#000',
};
