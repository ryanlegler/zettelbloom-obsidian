import { App, TFile } from "obsidian";
import { TOPIC_TAG } from "src/constants";
import { ZettelBloomSettings } from "types";

export async function removeBookmarkWithoutTag({
	app,
	settings,
}: {
	app: App;
	settings: ZettelBloomSettings;
}) {
	const currentFile = app.workspace.getActiveFile(); // Currently Open Note
	if (!currentFile) {
		console.error("No file is currently open.");
		return;
	}
	const content = await app.vault.read(currentFile);
	// find all links in the page that looks like this ![[LINK_HERE]]
	const links = content.match(/!\[\[.*?\]\]/g) || [];

	for (const link of links) {
		const newFileName = link.replace("![[", "").replace("]]", "");
		const path = `${settings.resourceFolderPath}/${newFileName}.md`;
		let file = app.vault.getAbstractFileByPath(path);

		if (!file) {
			continue;
		}

		try {
			const content = await app.vault.read(file as TFile);
			const doesContainTag = content.includes(TOPIC_TAG);

			if (!doesContainTag) {
				app.vault
					.read(currentFile)
					.then((currentContent) => {
						app.vault
							.modify(
								currentFile,
								currentContent.replace(link, "")
							)
							.then(() => {
								console.log(
									"Gather link removed successfully."
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
		} catch (error) {
			console.error("Error reading file:", error);
		}
	}
}
