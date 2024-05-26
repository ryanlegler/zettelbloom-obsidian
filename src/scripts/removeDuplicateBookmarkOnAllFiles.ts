import { App, Notice, TFile } from "obsidian";
import ZettelBloom from "main";

export async function removeDuplicateBookmarkOnAllFiles(plugin: ZettelBloom) {
	const { settings, app } = plugin;
	const markdownFiles = app.vault.getMarkdownFiles();

	for (const file of markdownFiles) {
		if (file.path.startsWith(settings.devTopicFolderPath)) {
			const content = await app.vault.read(file);
			const links = content.match(/!\[\[.*?\]\]/g) || [];

			const duplicateLinks = links.filter((link, index) => {
				return (links as string[]).indexOf(link) !== index;
			});

			for (const duplicate of duplicateLinks) {
				try {
					await app.vault
						.read(file)
						.then((currentContent) => {
							app.vault
								.modify(
									file,
									currentContent.replace(duplicate, "")
								)
								.then(() => {
									console.log(
										"Duplicate link removed successfully."
									);
								})
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
		}
	}
}
