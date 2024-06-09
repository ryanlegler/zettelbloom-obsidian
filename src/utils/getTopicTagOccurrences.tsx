import ZettelBloom from "main";
import { TFile } from "obsidian";

export function getTopicTagOccurrences({
	file,
	plugin,
}: {
	file: TFile;
	plugin: ZettelBloom;
}) {
	const backlinks = (plugin.app.metadataCache as any).getBacklinksForFile(
		file
	)?.data;

	const backlinksArray = backlinks ? Object.keys(backlinks) : [];

	return backlinksArray
		?.filter((link) => {
			return link.includes(plugin.settings.devTopicFolderPath);
		})
		.map((link) => {
			return link
				.split(plugin.settings.devTopicFolderPath)?.[1]
				?.replace("/", "")
				?.replace(".md", "");
		});
}
