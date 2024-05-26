// const files = this.app.vault.getMarkdownFiles();

// 			for (const file of files) {
// 				if (file.path.startsWith(this.settings.resourceFolderPath)) {
// 					const cache = app.metadataCache.getFileCache(file);
// 					const url = cache?.frontmatter?.source; // assumes we are using the "topicTags" frontmatter for tags

// 				}
// 			}

// 			const sourceLinks = files.reduce((acc, file) => {
// 				if (file.path.startsWith(this.settings.resourceFolderPath)) {
// 					const cache = app.metadataCache.getFileCache(file);
// 					const url = cache?.frontmatter?.source; // assumes we are using the "topicTags" frontmatter for tags
// 					if (url) {
// 						acc.push(url);
// 					}
// 				}
// 				return acc;
// 			}, [] as string[]);

// 			const cacheObject = sourceLinks.reduce((acc, link) => {
// 				acc[link] = new Date();
// 				return acc;
// 			}, {} as Record<string, Date>);

// this.settings.resourceUrlCache = cacheObject;
// 			await this.saveSettings();
