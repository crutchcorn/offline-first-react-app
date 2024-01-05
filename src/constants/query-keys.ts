export const customerKeys = {
	all: ['customers'] as const,
	lists: () => [...customerKeys.all, 'list'] as const,
	details: () => [...customerKeys.all, 'detail'] as const,
	detail: (id: string | number) => [...customerKeys.details(), id] as const,
};
