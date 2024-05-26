import ZettelBloom from "main";
import { TFile } from "obsidian";
import { removeResourceUrlCache } from "./removeResourceUrlCache";

export async function removeBookmarkFromFilePath({
	plugin,
	file,
}: {
	plugin: ZettelBloom;
	file: TFile;
}) {
	const { app } = plugin;

	const cache = app.metadataCache.getFileCache(file);
	const backlinks = (app.metadataCache as any).getBacklinksForFile(file).data;

	const { source } = cache?.frontmatter || {};
	const backlinksArray = Object.keys(backlinks);

	const toReplace = file ? `![[${file.basename}]]` : "";

	for (const backlink of backlinksArray) {
		const file = app.vault.getAbstractFileByPath(backlink) as TFile;

		await app.vault
			.read(file)
			.then((currentContent) => {
				app.vault
					.modify(file, currentContent.replace(toReplace, ""))
					.then(() => {})
					.catch((err) => {
						console.error("Error modifying file:", err);
					});
			})
			.catch((err) => {
				console.error("Error reading file:", err);
			});
	}

	// remove from cache
	await removeResourceUrlCache({ link: source, plugin });
	// delete this file in obsidian
	await app.vault.delete(file as TFile);
}
