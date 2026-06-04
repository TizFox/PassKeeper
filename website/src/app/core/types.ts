export type Account = {
	name: string;
	username: string;
	password: string;
	notes?: string;
	category: Category;
};

export type Category = {
	text: string;
	color: string;
};
