import { App, TFile } from "obsidian";
import { TOPIC_TAG } from "src/constants";
import { ZettelBloomSettings } from "types";

export async function replaceTagInAllBookmarks({
	app,
	settings,
}: {
	app: App;
	settings: ZettelBloomSettings;
}) {
	console.log("🚀 ~ settings:", settings);
	const markdownFiles = app.vault.getMarkdownFiles();

	for (const file of markdownFiles) {
		if (file.path.startsWith(settings.resourceFolderPath)) {
			app.vault
				.read(file)
				.then((currentContent) => {
					// Modify the file with the new content
					app.vault
						.modify(
							file,
							currentContent.replace("#gather", TOPIC_TAG)
						)
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
