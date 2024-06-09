import ZettelBloom from "main";

export async function replaceTagInAllBookmarks({
	plugin,
}: {
	plugin: ZettelBloom;
}) {
	const { settings, app } = plugin;
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
							currentContent.replace("#gather", "OTHER")
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
