import { MarkdownPostProcessorContext, TFile } from "obsidian";
import { ZettelMarkProps } from "src/components/ZettelMark";

export function getZettelMarkPropsFromContext(
	context: MarkdownPostProcessorContext
) {
	const file = this.app.vault.getAbstractFileByPath(
		context.sourcePath
	) as TFile;
	const cache = this.app.metadataCache.getFileCache(file);

	const { title, source, description, image } = cache?.frontmatter || {};

	return {
		title,
		source,
		description,
		image,
	} as ZettelMarkProps;
}
