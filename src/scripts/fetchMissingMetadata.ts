import { App, Notice, TFile } from "obsidian";
import { getMetaData } from "src/utils/getMetaData";
import { getRichLinkTemplate } from "src/utils/getRichLinkTemplate";
import { MetaData, ZettelBloomSettings } from "types";

export async function fetchMissingMetadata({
	app,
	settings,
}: {
	app: App;
	settings: ZettelBloomSettings;
}) {
	const markdownFiles = app.vault.getMarkdownFiles();

	for (const file of markdownFiles) {
		const cache = app.metadataCache.getFileCache(file as TFile);
		const { title, source, topicTags } = cache?.frontmatter || {};
		if (
			file.path.startsWith(settings.resourceFolderPath) &&
			source &&
			!title
		) {
			const metadata: MetaData["metadata"] = await getMetaData(source);
			app.vault
				.read(file)
				.then(() => {
					new Notice(`✅ ${source} - UPDATED`);
					const contents = getRichLinkTemplate({
						metadata,
						tags: topicTags, // use AI for tag generation?
					});

					app.vault
						.modify(file, contents)
						.then(() => {
							console.log(
								"Content added to the file successfully."
							);
						})
						.catch((err) => {
							console.error("Error modifying file:", err);
						});
				})
				.catch((err) => {
					console.error("Error reading file:", err);
				});
		}
	}
}
