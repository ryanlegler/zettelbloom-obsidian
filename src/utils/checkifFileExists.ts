import { Bookmark } from "types";
import { sanitizeFileName } from "./sanitizeFileName";
import { sanitizeUrl } from "./sanitizeUrl";
import ZettelBloom from "main";

export async function checkIfFileExists({
	bookmark,
	plugin,
}: {
	bookmark: Bookmark;
	plugin: ZettelBloom;
}) {
	const { settings, app } = plugin;
	const { title, source } = bookmark || {};
	// the new file name
	const newFileName = `${settings.resourceEmojiPrefix} ${
		sanitizeFileName(title) || sanitizeUrl(source)
	}`;

	const { resourceFolderPath } = settings || {};

	// the file path - includes the folder path and the file name and extension
	const filePath = `${resourceFolderPath}/${newFileName}.md`;

	// check if the file already exists
	const fileExists = !!app.vault.getAbstractFileByPath(filePath);

	return { fileExists, filePath, newFileName };
}
