import { App, Notice, TFile, stringifyYaml, parseYaml } from "obsidian";
import { ZETTEL_MARK_SHORT_CODE } from "src/constants";
import { MetaData, ZettelBloomSettings } from "types";

export async function convertToZettelMark({
	app,
	settings,
}: {
	app: App;
	settings: ZettelBloomSettings;
}) {
	const markdownFiles = app.vault.getMarkdownFiles();

	for (const file of markdownFiles) {
		const contents = await app.vault.cachedRead(file);
		const containsZettelMark = contents.includes("zettelMark");
		if (
			file.path.startsWith(settings.resourceFolderPath) &&
			!containsZettelMark
		) {
			const currentInlineTags = contents.match(/#(\w+)/g) || [];
			const tagsToString = currentInlineTags.join(", ");

			const frontmatter =
				app.metadataCache.getFileCache(file)?.frontmatter;

			const stringifiedFrontmatter = stringifyYaml(frontmatter);
			const newContents = `---\n${stringifiedFrontmatter}\n---\n${tagsToString}\n\n${ZETTEL_MARK_SHORT_CODE}\n`;

			app.vault
				.read(file)
				.then(() => {
					new Notice(`✅ ${frontmatter?.title} - UPDATED`);
					app.vault
						.modify(file, newContents)
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
		} else if (
			file.path.startsWith(settings.resourceFolderPath) &&
			containsZettelMark
		) {
			const frontmatter =
				app.metadataCache.getFileCache(file)?.frontmatter;
			// new Notice(`✅ ${frontmatter?.title} - NO CHANGES NEEDED`);
		}
	}
}
