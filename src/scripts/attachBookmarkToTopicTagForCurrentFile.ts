import ZettelBloom from "main";
import { App, Notice, TFile } from "obsidian";

import { handleTopicTagPages } from "src/utils/handleTopicTagPages";

// The function below is supposed to attach bookmarks to topic tag files
export async function attachBookmarkToTopicTagForCurrentFile(
	plugin: ZettelBloom
) {
	const { settings, app } = plugin;
	const markdownFiles = app.vault.getMarkdownFiles();

	// all the dev topic file paths
	const devTopicFilePaths =
		markdownFiles
			?.map((file) => file?.path)
			.filter((path) => {
				return path?.startsWith(settings.devTopicFolderPath);
			}) || [];

	const file = app.workspace.getActiveFile(); // Currently Open Note
	if (!file) {
		console.error("No file is currently open.");
		return;
	}

	const cache = app.metadataCache.getFileCache(file as TFile);
	const { topicTags } = cache?.frontmatter || {};
	new Notice(`TAGS: ${topicTags}.`);
	if (
		file.path.startsWith(settings.resourceFolderPath) &&
		topicTags?.length
	) {
		// we are a resource with tags...
		// the function will add a link to the
		await handleTopicTagPages({
			settings,
			tags: topicTags,
			newFileName: file?.basename,
			app,
			devTopicFilePaths,
		});
	} else {
		new Notice(`No Topic Tags files found`);
	}
}
