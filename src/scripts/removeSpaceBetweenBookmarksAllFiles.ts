import { removeSpaceBetweenBookmarksOnFile } from "./removeSpaceBetweenBookmarksOnFile";
import ZettelBloom from "main";

export async function removeSpaceBetweenBookmarksAllFiles(plugin: ZettelBloom) {
	const { settings, app } = plugin;
	const markdownFiles = app.vault.getMarkdownFiles();

	for (const file of markdownFiles) {
		if (file.path.startsWith(settings.devTopicFolderPath)) {
			await removeSpaceBetweenBookmarksOnFile(plugin);
		}
	}
}
