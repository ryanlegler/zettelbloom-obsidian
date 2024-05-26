import ZettelBloom from "main";

export async function removeDuplicateBookmarkOnFile(plugin: ZettelBloom) {
	const { app } = plugin;
	const currentFile = app.workspace.getActiveFile(); // Currently Open Note
	if (!currentFile) {
		console.error("No file is currently open.");
		return;
	}
	const content = await app.vault.read(currentFile);
	const links = content.match(/!\[\[.*?\]\]/g) || [];

	const duplicateLinks = links.filter((link, index) => {
		return (links as string[]).indexOf(link) !== index;
	});

	for (const duplicate of duplicateLinks) {
		try {
			await app.vault
				.read(currentFile)
				.then((currentContent) => {
					app.vault
						.modify(
							currentFile,
							currentContent.replace(duplicate, "")
						)
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
}
