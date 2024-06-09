export function removeExtraLineBreaks(input: string) {
	const lines = input.split("\n");
	let chunks: { start: number; end: number }[] = [];

	lines.forEach((line, index) => {
		const hasLink = line.startsWith("![[");

		if (hasLink) {
			const remainingLines = lines.slice(index + 1, lines.length + 1);
			const nextLinkIndex = remainingLines.findIndex((line) =>
				line.startsWith("![[")
			);

			const contentsBetweenCurrentAndNextLink = remainingLines.slice(
				0,
				nextLinkIndex
			);
			if (
				contentsBetweenCurrentAndNextLink.length > 1 &&
				contentsBetweenCurrentAndNextLink?.every(
					(line) => line.trim() === ""
				)
			) {
				const end = nextLinkIndex + index;
				chunks.push({
					start: index + 1,
					end,
				});
			}
		}
	});

	// based on the start and end index of the chunks, we can filter the lines that are not part of the chunks
	const filteredLines = lines.filter((line, index) => {
		return !chunks.some(
			(chunk) => index >= chunk.start && index <= chunk.end
		);
	});

	// loop over the filtered lines and add one additional newline between each line when the lines are both markdown links
	for (let i = 0; i < filteredLines.length - 1; i++) {
		const currentLine = filteredLines[i];
		const nextLine = filteredLines[i + 1];

		const currentLineIsLink = currentLine.startsWith("![[");
		const nextLineIsLink = nextLine.startsWith("![[");

		if (currentLineIsLink && nextLineIsLink) {
			filteredLines[i] = `${currentLine}\n`;
		}
	}

	return filteredLines.join("\n");
}
