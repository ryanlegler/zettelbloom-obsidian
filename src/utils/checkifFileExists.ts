import { ZettelBloomSettings } from "types";
import { sanitizeFileName } from "./sanitizeFileName";
import { sanitizeUrl } from "./sanitizeUrl";
import { App } from "obsidian";

export function checkIfFileExists({
	settings,
	title,
	website,
	app,
}: {
	settings: ZettelBloomSettings;
	website: string;
	title: string;
	app: App;
}) {
	// the new file name
	let newFileName = `🔗 ${sanitizeFileName(title) || sanitizeUrl(website)}`;

	const { resourceFolderPath } = settings || {};

	// the file path - includes the folder path and the file name and extension
	const filePath = `${resourceFolderPath}/${newFileName}.md`;

	// check if the file already exists
	const fileExists = !!app.vault.getAbstractFileByPath(filePath);

	return { fileExists, filePath, newFileName };
}
