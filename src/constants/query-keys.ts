// DO NOT CLEAR THIS CACHE OTHERWISE IT WILL CAUSE AN INFINITE LOOP ON THE INITIAL DOWNLOAD SCREEN
export const initialDownloadKeys = {
	all: ["initialDownload"] as const,
	status: (status: string) => [...initialDownloadKeys.all, status] as const,
};

export const customerKeys = {
	all: ["customers"] as const,
	lists: () => [...customerKeys.all, "list"] as const,
	details: () => [...customerKeys.all, "detail"] as const,
	detail: (id: string | number) => [...customerKeys.details(), id] as const,
};
