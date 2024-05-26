import ZettelBloom from "main";
import { App, TFile } from "obsidian";
import { TOPIC_TAG } from "src/constants";

export async function removeTagFromBookmarks(plugin: ZettelBloom) {
	const { settings, app } = plugin;
	const currentFile = app.workspace.getActiveFile(); // Currently Open Note
	if (!currentFile) {
		console.error("No file is currently open.");
		return;
	}
	const content = await app.vault.read(currentFile);
	// find all links in the page that looks like this ![[LINK_HERE]]
	const links = content.match(/!\[\[.*?\]\]/g) || [];

	for (const link of links) {
		const newFileName = link.replace(/[\[\]!]/g, "");
		const path = `${settings.resourceFolderPath}/${newFileName}.md`;
		let file = app.vault.getAbstractFileByPath(path) as TFile;
		app.vault
			.read(file)
			.then((currentContent) => {
				// Modify the file with the new content
				app.vault
					.modify(file, currentContent.replace(TOPIC_TAG, ""))
					.then(() => {
						console.log("Content added to the file successfully.");
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
