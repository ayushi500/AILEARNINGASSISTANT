/**
 * Split text into smaller chunks for AI processing
 * Keeps paragraph meaning + supports overlap
 *
 * @param {string} text - Full text
 * @param {number} chunkSize - Max words per chunk
 * @param {number} overlap - Overlapping words between chunks
 * @returns {Array<{content:string, chunkIndex:number, pageNumber:number}>}
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {

  // Handle empty text
  if (!text || text.trim().length === 0) {
    return [];
  }

  /**
   * ---------- CLEAN TEXT ----------
   */
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  /**
   * ---------- SPLIT INTO PARAGRAPHS ----------
   */
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter(p => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  /**
   * ---------- PROCESS EACH PARAGRAPH ----------
   */
  for (const paragraph of paragraphs) {

    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    /**
     * ---------- CASE 1:
     * Paragraph itself is larger than chunk size
     * So break it into mini chunks
     */
    if (paragraphWordCount > chunkSize) {

      // If something already exists → push before splitting paragraph
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        currentChunk = [];
        currentWordCount = 0;
      }

      for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);

        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        if (i + chunkSize >= paragraphWords.length) break;
      }

      continue;
    }

    /**
     * ---------- CASE 2:
     * Adding this paragraph would exceed chunk size
     * So finalize current chunk & start new one with overlap
     */
    if (currentWordCount + paragraphWordCount > chunkSize) {

      // save current chunk
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      // create overlapping text
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      // start new chunk with overlap
      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount =
        overlapText.split(/\s+/).length + paragraphWordCount;
    }

    /**
     * ---------- CASE 3:
     * Normal paragraph → just add it
     */
    else {
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  /**
   * ---------- ADD LAST CHUNK ----------
   */
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex,
      pageNumber: 0
    });
  }

  /**
   * ---------- FALLBACK ----------
   * If everything failed → split whole text by words
   */
  if (chunks.length === 0 && cleanedText.length > 0) {

    const allWords = cleanedText.split(/\s+/);

    for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
      const chunkWords = allWords.slice(i, i + chunkSize);

      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {

    // If no chunks or no query → return empty
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }

    // Common stop words to exclude
    const stopWords = new Set([
        "the", "is", "at", "which", "on", "a", "an",
        "and", "or", "but", "in", "with", "to", "for",
        "of", "as", "by", "this", "that", "it"
    ]);

    // Extract and clean query words
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    // If no useful query words → return top N chunks
    if (queryWords.length === 0) {
        return chunks
            .slice(0, maxChunks)
            .map(chunk => ({
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                pageNumber: chunk.pageNumber,
                _id: chunk._id,
            }));
    }

    // Score each chunk
    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase();
        const contentWords = content.split(/\s+/).length;
        let score = 0;

        // Score each query word
        for (const word of queryWords) {

            // Exact word match → higher score
            const exactMatches =
                (content.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
            score += exactMatches * 3;

            // Partial word match → smaller score
            const partialMatches =
                (content.match(new RegExp(word, "g")) || []).length;
            score += Math.max(0, partialMatches - exactMatches) * 1.5;
        }

        // Bonus: multiple query words found
        const uniqueWordsFound = queryWords.filter(word =>
            content.includes(word)
        ).length;

        if (uniqueWordsFound > 1) {
            score += uniqueWordsFound * 2;
        }

        // Normalize by chunk length
        const normalizedScore = score / Math.sqrt(contentWords);

        // Small bonus for earlier chunks
        const positionBonus = 1 - (index / chunks.length) * 0.1;

        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordsFound
        };
    });

   return scoredChunks
  .filter(chunk => chunk.score > 0)
  .sort((a, b) => {
    // 1️⃣ Sort by score (higher score first)
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // 2️⃣ If score is same, sort by matched words count
    if (b.matchedWords !== a.matchedWords) {
      return b.matchedWords - a.matchedWords;
    }

    // 3️⃣ If still same, keep earlier chunk first
    return a.chunkIndex - b.chunkIndex;
  })
  .slice(0, maxChunks);

};
