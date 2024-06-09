import ZettelBloom from "main";
import { removeExtraLineBreaks } from "src/utils/removeExtraLineBreaks";

export async function removeSpaceBetweenBookmarksOnFile(plugin: ZettelBloom) {
	const { app } = plugin;
	const currentFile = app.workspace.getActiveFile(); // Currently Open Note
	if (!currentFile) {
		console.error("No file is currently open.");
		return;
	}
	const content = await app.vault.read(currentFile);
	const output = removeExtraLineBreaks(content);

	try {
		await app.vault
			.read(currentFile)
			.then((currentContent) => {
				app.vault
					.modify(currentFile, output)
					.then(() => {})
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
