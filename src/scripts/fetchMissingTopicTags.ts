import { App, TFile } from "obsidian";
import { getTopicTagSet } from "src/utils/getTopicTagSet";
import { processTopicTagForFile } from "src/utils/processTopicTagForFile";
import ZettelBloom from "main";
export async function fetchMissingTopicTags({
	app,
	plugin,
}: {
	app: App;
	plugin: ZettelBloom;
}) {
	const markdownFiles = app.vault.getMarkdownFiles();
	const { settings, app } = plugin;
	let folderPath = settings.resourceFolderPath;
	const tagList = getTopicTagSet({
		files: app.vault.getMarkdownFiles(),
		resourceFolderPath: folderPath,
	});

	for (const file of markdownFiles) {
		const cache = app.metadataCache.getFileCache(file as TFile);

		const { source, topicTags } = cache?.frontmatter || {};
		if (
			file.path.startsWith(settings.resourceFolderPath) &&
			source &&
			!topicTags?.length
		) {
			// add a 1 second sleep to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 1000));
			await processTopicTagForFile({
				app,
				file,
				settings,
				tagList,
				metadata: cache?.frontmatter,
			});
		}
	}
}
