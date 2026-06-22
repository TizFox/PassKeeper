type AnyFormSchema = Record<string, () => { errors: () => { message: string }[] }>;

export const getFormErrors = (model: object, form: unknown): string => {
	return Object.keys(model)
		.flatMap((field) => (form as AnyFormSchema)[field]?.().errors() ?? [])
		.map((err) => err.message)
		.join(', ');
};
