/**
 * Creates a promise that resolves after a specified delay.
 *
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Retries an asynchronous function with exponential backoff.
 *
 * @template T The type of the value returned by the function.
 * @param {() => Promise<T>} fn - The asynchronous function to retry.
 * @param {object} [options] - Optional configuration for the retry mechanism.
 * @param {number} [options.maxRetries=5] - Maximum number of retry attempts.
 * @param {number} [options.baseDelay=500] - Base delay in milliseconds between retries.
 * @param {(error: unknown, attempt: number) => boolean} [options.shouldRetry] - Function to determine if a retry should be attempted based on the error and attempt number.
 * @returns {Promise<T>} A promise that resolves with the result of the function or rejects if all retries fail.
 * @throws {Error} If all retry attempts fail.
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: {
		maxRetries?: number
		baseDelay?: number
		shouldRetry?: (error: unknown, attempt: number) => boolean
	} = {},
): Promise<T> {
	const { maxRetries = 5, baseDelay = 500, shouldRetry = () => true } = options

	let lastError: unknown

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error

			if (attempt === maxRetries || !shouldRetry(error, attempt)) {
				break
			}

			const delayMs = baseDelay * 2 ** (attempt - 1)
			await delay(delayMs)
		}
	}

	throw lastError || new Error("Unexpected error in retryWithBackoff")
}
