interface ChunkForEachOptions<T> {
	chunkSize?: number;
	signal?: AbortSignal;
	arr: T[];
	eachItemfn: (item: T) => void | Promise<void>;
	// Called after each chunk is processed
	eachChunkFn: (chunkIndex: number) => void | Promise<void>;
	delayTime?: (i: number) => number;
}

/**
 * Chunk an array so that it doesn't block the main thread during large iterations.
 * Returns a promise that resolves when all chunks have been processed.
 * Chunks are not guaranteed to be processed in order.
 */
export async function chunkForEach<T>(opts: ChunkForEachOptions<T>) {
	const {
		eachChunkFn,
		eachItemfn,
		arr,
		chunkSize = 100,
		signal,
		delayTime = () => 1,
	} = opts;
	const chunks = Math.ceil(arr.length / chunkSize);

	for (let i = 0; i < chunks; i++) {
		if (signal?.aborted) {
			return;
		}
		const start = i * chunkSize;
		const end = start + chunkSize;
		const slice = arr.slice(start, end);

		await new Promise<void>((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			const timeout = setTimeout(async () => {
				try {
					await Promise.all(
						slice.map(async (item) => {
							await eachItemfn(item);
						}),
					);
					await eachChunkFn(i);
					resolve();
				} catch (err) {
					reject(err);
				}
			}, delayTime(i));
			if (signal) {
				signal.addEventListener("abort", () => {
					clearTimeout(timeout);
					resolve();
				});
			}
		});
	}
}
