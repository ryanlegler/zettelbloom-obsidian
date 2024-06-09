// seed cache....
// const files = this.app.vault.getMarkdownFiles();

// const sourceLinks = files.reduce((acc, file) => {
// 	if (file.path.startsWith(this.settings.resourceFolderPath)) {
// 		const cache = app.metadataCache.getFileCache(file);
// 		const url = cache?.frontmatter?.source; // assumes we are using the "topicTags" frontmatter for tags
// 		if (url) {
// 			acc.push(url);
// 		}
// 	}
// 	return acc;
// }, [] as string[]);

// const cacheObject = sourceLinks.reduce((acc, link) => {
// 	const newLink = cleanPermalink(link);
// 	if (newLink) {
// 		acc[newLink] = new Date();
// 	}
// 	return acc;
// }, {} as Record<string, Date>);

// const newCacheObject = {
// 	...cacheObject,
// 	...this.settings.resourceUrlCache,
// };

// this.settings.resourceUrlCache = newCacheObject;
// await this.saveSettings();

// seed cache end....
