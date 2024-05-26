import ZettelBloom from "main";
import { TFile } from "obsidian";

import { handleTopicTagPages } from "src/utils/handleTopicTagPages";

// The function below is supposed to attach bookmarks to topic tag files
export async function attachBookmarkToTopicTagFiles(plugin: ZettelBloom) {
	const { settings, app } = plugin;
	const markdownFiles = app.vault.getMarkdownFiles();

	// all the dev topic file paths
	const devTopicFilePaths =
		markdownFiles
			?.map((file) => file?.path)
			.filter((path) => {
				return path?.startsWith(settings.devTopicFolderPath);
			}) || [];

	for (const file of markdownFiles) {
		// how do i get the inlinks of a file?

		const cache = app.metadataCache.getFileCache(file as TFile);
		const { topicTags } = cache?.frontmatter || {};
		if (
			file.path.startsWith(settings.resourceFolderPath) &&
			topicTags?.length
		) {
			// we are a resource with tags...
			await handleTopicTagPages({
				settings,
				tags: topicTags,
				newFileName: file?.basename,
				app,
				devTopicFilePaths,
			});
			// this was written to check if the file has backlinks and then only create the topic tag pages if it can no backlinks other than the inbox
			// const backlinks = app.metadataCache.getBacklinksForFile(file).data;
			// // convert the backlinks object to an array of objects
			// const backlinksArray = Object.entries(backlinks)
			// 	.map(([sourcePath, linkDetails]) => {
			// 		return { sourcePath, linkDetails };
			// 	})
			// 	.filter((link) => link.sourcePath !== `📥 Gather (Inbox).md`);
			// if (!backlinksArray.length) {
			// 	await handleTopicTagPages({
			// 		settings,
			// 		tags: topicTags,
			// 		newFileName: file?.basename,
			// 		app,
			// 	});
			// }
		}
	}
}
