import { TFile } from "obsidian";

export function getTopicTagSet({
	files,
	resourceFolderPath,
}: {
	files: TFile[];
	resourceFolderPath: string;
}) {
	let topicTags = new Set("");
	for (const file of files) {
		if (file.path.startsWith(resourceFolderPath)) {
			const cache = app.metadataCache.getFileCache(file);
			const tags = cache?.frontmatter?.topicTags; // assumes we are using the "topicTags" frontmatter for tags
			if (tags) {
				tags.forEach((tag: string) => {
					topicTags.add(tag);
				});
			}
		}
	}
	return topicTags;
}
