// const tagToAdd = "Foo";
// async function addTag(file: any) {
// 	const fileContents = await this.app.vault.read(file);
// 	if (!fileContents.startsWith(tagToAdd)) {
// 		// add the tag after the frontmatter ends
// 		const frontmatterEnd = fileContents.indexOf("---", 4);
// 		const newContents =
// 			fileContents.slice(0, frontmatterEnd + 4) +
// 			tagToAdd +
// 			fileContents.slice(frontmatterEnd + 4);

// 		await this.app.vault.modify(file, newContents);
// 	}
// }

// const resourcesPath = "fooo";
// async function backFillTopicTags() {
// 	const markdownFiles = app.vault.getMarkdownFiles();
// 	for (const file of markdownFiles) {
// 		if (file.path.startsWith(resourcesPath)) {
// 			const fileContents = await app.vault.read(file);
// 			const cache = app.metadataCache.getFileCache(file);
// 			if (!cache?.frontmatter?.topicTags) {
// 				const emptyTopicTags = `topicTags:\n`;
// 				const frontMatterEndIndex = fileContents.indexOf("---", 4);
// 				const before = fileContents.substring(
// 					0,
// 					frontMatterEndIndex - 4
// 				);
// 				const afterFrontMatter =
// 					fileContents.substring(frontMatterEndIndex);
// 				const newFileContents = `${before}\n${emptyTopicTags}\n${afterFrontMatter}`;
// 				await app.vault.modify(file, newFileContents);
// 			}
// 		}
// 	}
//}

// async function getFrontmatter(file) {
//     const currentFile = file || app.workspace.getActiveFile(); // Currently Open Note
//     const fileContents = await app.vault.read(currentFile);
//     const start = fileContents.indexOf("---");
//     if (start !== -1) {
//         const end = fileContents.indexOf("---", start + 3);
//         if (end !== -1) {
//             const frontMatter = fileContents.substring(start + 3, end).trim();
//             console.log(frontMatter);
//         }
//     }
// }

//         const frontMatterRegex = /^---\s*[\s\S]*?---/;
//         const existingFrontMatter = fileContents.match(frontMatterRegex);
//         const frontMatterString = existingFrontMatter?.[0] || "";
