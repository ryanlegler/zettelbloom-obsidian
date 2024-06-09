import ZettelBloom from "main";
import { Bookmark } from "types";

import { cleanPermalink } from "./cleanPermalink";

// if the link is already saved we should lookup the correct file path by the source of the bookmark
export function lookupFileName({
	plugin,
	bookmark,
}: {
	plugin: ZettelBloom;
	bookmark: Bookmark;
}) {
	const AllFiles = plugin.app.vault.getMarkdownFiles();
	const match = AllFiles.filter((file) => {
		const frontmatter =
			plugin.app.metadataCache.getFileCache(file)?.frontmatter;
		return (
			cleanPermalink(frontmatter?.source) ===
			cleanPermalink(bookmark.source)
		);
	})?.[0];

	return { filePath: match?.path, fileName: match?.basename };
}
