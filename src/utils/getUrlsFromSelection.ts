import { extractUrlFromMarkdown } from "./extractUrlFromMarkdown";

export function getUrlsFromSelection(selection: string): string[] {
	const lines = selection?.split("\n").filter(Boolean);
	return lines?.map((line) => extractUrlFromMarkdown(line)) || [];
}
