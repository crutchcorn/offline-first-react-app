interface ChunkForEachOptions<T> {
	chunkSize?: number;
	signal?: AbortSignal;
	arr: T[];
	eachItemfn: (item: T) => void;
	eachChunkFn: (chunkIndex: number) => void;
}

/**
 * Chunk an array so that it doesn't block the main thread during large iterations.
 * Returns a promise that resolves when all chunks have been processed.
 * Chunks are not guaranteed to be processed in order.
 */
export async function chunkForEach<T>(opts: ChunkForEachOptions<T>) {
	const { eachChunkFn, eachItemfn, arr, chunkSize = 100, signal } = opts;
	const chunks = Math.ceil(arr.length / chunkSize);

	const promises: Promise<void>[] = [];
	for (let i = 0; i < chunks; i++) {
		const start = i * chunkSize;
		const end = start + chunkSize;
		promises.push(
			new Promise<void>((resolve) => {
				const timeout = setTimeout(() => {
					arr.slice(start, end).forEach((item) => {
						eachItemfn(item);
						resolve();
					});
					eachChunkFn(i);
				}, 1);

				if (signal) {
					signal.addEventListener("abort", () => {
						clearTimeout(timeout);
						resolve();
					});
				}
			}),
		);
	}

	return await Promise.all(promises);
}
