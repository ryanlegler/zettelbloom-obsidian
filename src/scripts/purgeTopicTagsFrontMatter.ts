// DEPRECATE

import ZettelBloom from "main";
import { App, Notice, TFile, stringifyYaml, parseYaml } from "obsidian";

export async function purgeTopicTagsFrontMatter(plugin: ZettelBloom) {
	const { settings, app } = plugin;
	const markdownFiles = app.vault.getMarkdownFiles();

	for (const file of markdownFiles) {
		if (
			// file.basename === "🔗 Brief Note on Popovers with Dialogs" &&
			file.path.startsWith(settings.resourceFolderPath)
		) {
			const frontmatter =
				app.metadataCache.getFileCache(file)?.frontmatter;

			const { topicTags, ...rest } = frontmatter || {};

			await app.vault.read(file).then((content) => {
				// const selection =
				// 	content.match(/topicTags:\n(.*\n)*?---/)?.[0] || "";
				// const result = content.replace(selection, "---");
				app.vault.modify(file, content.replace("------", "---"));
			});
		}
	}
}
