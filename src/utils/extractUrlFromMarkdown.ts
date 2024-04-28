export function extractUrlFromMarkdown(input: string = "") {
	const match = input.match(/\((http[s]?:\/\/[^\)]+)\)/);
	return match ? match[1] : input;
}
