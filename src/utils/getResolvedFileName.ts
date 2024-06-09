import ZettelBloom from "main";
import { Bookmark } from "types";
import { sanitizeFileName } from "./sanitizeFileName";

export function getResolvedFileName({
	plugin,
	bookmark,
}: {
	plugin: ZettelBloom;
	bookmark: Bookmark;
}) {
	const { settings, app } = plugin;
	const { resourceFolderPath } = settings || {};
	const { title, description } = bookmark || {};

	const titleFilePath =
		sanitizeFileName(title) &&
		`${resourceFolderPath}/${
			settings.resourceEmojiPrefix
		} ${sanitizeFileName(title)}.md`;

	const fallbackFilePath = `${resourceFolderPath}/${
		settings.resourceEmojiPrefix
	} ${sanitizeFileName(description || "")}.md`;

	// is it valid and does it not already exist...
	const filePath =
		titleFilePath && !app.vault.getAbstractFileByPath(titleFilePath)
			? titleFilePath
			: fallbackFilePath;

	const fileName = filePath.replace(`${resourceFolderPath}/`, "");

	return { filePath, fileName: fileName.replace(".md", "") };
}
