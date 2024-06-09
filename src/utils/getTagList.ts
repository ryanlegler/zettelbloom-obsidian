import ZettelBloom from "main";

export function getTagList(plugin: ZettelBloom) {
	const markdownFiles = plugin.app.vault.getMarkdownFiles();

	const tagListRaw = markdownFiles
		.filter((file) => {
			return file.path.startsWith(plugin.settings.devTopicFolderPath);
		})
		.map((file) => {
			return file.basename;
		});

	return [...new Set(tagListRaw)];
}
