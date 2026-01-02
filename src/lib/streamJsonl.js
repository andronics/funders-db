/**
 * Stream and parse a JSONL file, calling onRecord for each parsed line.
 * This allows progressive loading of large datasets.
 *
 * @param {string} url - URL to fetch JSONL from
 * @param {Object} options - Callbacks for handling the stream
 * @param {Function} options.onRecord - Called with (record, count) for each parsed line
 * @param {Function} options.onProgress - Called with progress (0-1) based on Content-Length
 * @param {Function} options.onError - Called with (error, line) for parse errors
 * @returns {Promise<number>} Total count of records parsed
 */
export async function streamJsonl(url, { onRecord, onProgress, onError }) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let count = 0;
  const contentLength = response.headers.get('Content-Length');
  let bytesReceived = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    bytesReceived += value.length;
    buffer += decoder.decode(value, { stream: true });

    // Process complete lines
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          const record = JSON.parse(line);
          count++;
          onRecord?.(record, count);
        } catch (e) {
          onError?.(e, line);
        }
      }
    }

    // Report progress
    if (contentLength) {
      onProgress?.(bytesReceived / parseInt(contentLength, 10));
    }
  }

  // Process any remaining data in buffer
  if (buffer.trim()) {
    try {
      const record = JSON.parse(buffer);
      count++;
      onRecord?.(record, count);
    } catch (e) {
      onError?.(e, buffer);
    }
  }

  // Ensure we report 100% at the end
  onProgress?.(1);

  return count;
}
