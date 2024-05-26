import ZettelBloom from "main";
import { TFile } from "obsidian";
import { getTopicTagSet } from "src/utils/getTopicTagSet";
import { processTopicTagForFile } from "src/utils/processTopicTagForFile";

export async function fetchMissingTopicTagsForFile(plugin: ZettelBloom) {
	const { settings, app } = plugin;
	let folderPath = settings.resourceFolderPath;
	const tagList = getTopicTagSet({
		files: app.vault.getMarkdownFiles(),
		resourceFolderPath: folderPath,
	});

	// get current file
	const file = app.workspace.getActiveFile();
	const cache = app.metadataCache.getFileCache(file as TFile);

	const { source, topicTags } = cache?.frontmatter || {};
	if (
		file?.path.startsWith(settings.resourceFolderPath) &&
		source &&
		!topicTags?.length
	) {
		await processTopicTagForFile({
			app,
			file,
			settings,
			tagList,
			metadata: cache?.frontmatter,
		});
	}
}
