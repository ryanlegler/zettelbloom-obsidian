import { App, Notice, TFile } from "obsidian";

import { getRichLinkTemplate } from "src/utils/getRichLinkTemplate";
import { Bookmark } from "types";
import ZettelBloom from "main";
import { getBookmarkFromUrl } from "src/dataLayer/getBookmarkFromUrl";

// Looks for files in the resource folder path that are missing metadata and fetches the re-fetches the metadata and writes back to the file
export async function fetchMissingMetadata(plugin: ZettelBloom) {
	const { settings, app } = plugin;
	const markdownFiles = app.vault.getMarkdownFiles();
	for (const file of markdownFiles) {
		const cache = app.metadataCache.getFileCache(file as TFile);
		const { title, source, description } = cache?.frontmatter || {};
		if (
			file.path.startsWith(settings.resourceFolderPath) &&
			source &&
			(!title || !description)
		) {
			const bookmark: Bookmark = await getBookmarkFromUrl(source);
			app.vault
				.read(file)
				.then(() => {
					new Notice(`✅ ${source} - UPDATED`);
					const contents = getRichLinkTemplate({
						bookmark,
					});

					app.vault
						.modify(file, contents)
						.then(() => {
							console.log(
								"Content added to the file successfully."
							);
						})
						.catch((err) => {
							console.error("Error modifying file:", err);
						});
				})
				.catch((err) => {
					console.error("Error reading file:", err);
				});
		}
	}
}
