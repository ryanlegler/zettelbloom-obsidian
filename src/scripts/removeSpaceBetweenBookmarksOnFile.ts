import ZettelBloom from "main";

// function formatMarkdown(input: string) {
// 	const allLines = input.split("\n");

// 	const cleanedLines = allLines.reduce(
// 		(
// 			acc: {
// 				lines: string[];
// 				skipNextLine: boolean;
// 			},
// 			line: string,
// 			index
// 		) => {
// 			const hasLink = line.startsWith("![[");
// 			const nextLineIsEmpty = allLines[index + 1]?.trim() === "";
// 			const lineAfterNextIsLink = allLines[index + 2]?.startsWith("![[");

// 			if (hasLink && nextLineIsEmpty && lineAfterNextIsLink) {
// 				// If current line is a markdown link and the next line is empty and the line after next is a markdown link,
// 				// add the current line to the accumulator and skip the next line
// 				acc.lines.push(line);
// 				acc.skipNextLine = true;
// 			} else if (!acc.skipNextLine || !hasLink) {
// 				// If the next line is not marked to be skipped or the current line is not a markdown link, add the current line to the accumulator
// 				acc.lines.push(line);
// 			} else {
// 				// Reset the flag to skip the next line
// 				acc.skipNextLine = nextLineIsEmpty && lineAfterNextIsLink;
// 			}

// 			return acc;
// 		},
// 		{ lines: [], skipNextLine: false }
// 	).lines;

// 	return cleanedLines.join("\n");
// }

function processMarkdown(input: string) {
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

export async function removeSpaceBetweenBookmarksOnFile(plugin: ZettelBloom) {
	const { app } = plugin;
	const currentFile = app.workspace.getActiveFile(); // Currently Open Note
	if (!currentFile) {
		console.error("No file is currently open.");
		return;
	}
	const content = await app.vault.read(currentFile);
	const output = processMarkdown(content);

	try {
		await app.vault
			.read(currentFile)
			.then((currentContent) => {
				app.vault
					.modify(currentFile, output)
					.then(() => {})
					.catch((err) => {
						console.error("Error modifying file:", err);
					});
			})
			.catch((err) => {
				console.error("Error reading file:", err);
			});
	} catch (error) {
		console.error("Error reading file:", error);
	}
}
