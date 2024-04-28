import { App, Notice, TFile } from "obsidian";
import { sanitizeFileName } from "./sanitizeFileName";
import { ZettelBloomSettings } from "types";

export async function handleTopicTagPages({
	tags,
	newFileName,
	app,
	settings,
}: {
	tags: string[];
	newFileName: string;
	app: App;
	settings: ZettelBloomSettings;
}) {
	for (const tag of tags) {
		let devTopicFileName = `🏷️ ${sanitizeFileName(tag)}`;
		const devTopicPath = `${settings.devTopicFolderPath}/${devTopicFileName}.md`;

		// check if the dev topic file already exists
		let devTopicFile = app.vault.getAbstractFileByPath(
			devTopicPath
		) as TFile;

		// create the dev topic file if it doesn't exist
		if (!devTopicFile) {
			new Notice(
				`✅  - New Dev Topic File: "${devTopicFileName}" Created`
			);
			// TODO - maybe the uplink should be optional
			const content = `\nup: [[${settings.devTopicUpLinkPath}]]\n\n![[${newFileName}]]\n\n`;
			await app.vault.create(devTopicPath, content);
		} else {
			// add the link to the dev topic file
			const currentContent = await app.vault.read(devTopicFile);
			await app.vault.modify(
				devTopicFile,
				currentContent + `![[${newFileName}]] \n \n`
			);
		}
	}
}
