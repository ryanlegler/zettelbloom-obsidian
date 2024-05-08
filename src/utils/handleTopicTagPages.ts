import { App, Notice, TFile } from "obsidian";
import { sanitizeFileName } from "./sanitizeFileName";
import { ZettelBloomSettings } from "types";

export async function handleTopicTagPages({
	tags,
	newFileName,
	app,
	settings,
	devTopicFilePaths,
}: {
	tags: string[];
	newFileName: string;
	app: App;
	settings: ZettelBloomSettings;
	devTopicFilePaths?: string[];
}) {
	console.log("🚀 ~ devTopicFilePaths:", devTopicFilePaths);
	for (const tag of tags) {
		let devTopicFileName = `🏷️ ${sanitizeFileName(tag)}`;

		const devTopicPath = `${settings.devTopicFolderPath}/${devTopicFileName}.md`;

		// const isMatch = devTopicFilePaths?.find(
		// 	(path) => path?.toLowerCase() === devTopicPath.toLowerCase()
		// );

		// check if the dev topic file already exists
		let devTopicFile = app.vault.getAbstractFileByPath(
			devTopicPath
		) as TFile;

		// create the dev topic file if it doesn't exist//
		// is there a better way to check if a file exists? one thats case insenstitive?

		// if (!devTopicFile && !isMatch) {
		if (!devTopicFile) {
			console.log("🚀 ~ devTopicPath:", devTopicPath);
			new Notice(`🚫 devTopicFile for path "${devTopicPath}" Not found`);
			new Notice(`✅ New Dev Topic File: "${devTopicFileName}" Created`);
			// TODO - maybe the uplink should be optional
			const content = `\nup: [[${settings.devTopicUpLinkPath}]]\n\n![[${newFileName}]]\n\n`;
			await app.vault.create(devTopicPath, content);
		} else {
			// add the link to the dev topic file

			await app.vault.read(devTopicFile).then((currentContent) => {
				// Add a link to the Bookmark at each link selection if it doesn't already exist
				if (!currentContent.includes(`![[${newFileName}]]`)) {
					new Notice(
						`✅ Dev Topic File: "${devTopicFileName}" Updated`
					);
					app.vault.modify(
						devTopicFile,
						currentContent + `![[${newFileName}]] \n \n`
					);

					// we should also remove the propagate link from the bookmark file
				} else {
					// new Notice(
					// 	`🚫 Dev Topic File: "${devTopicFileName}" Already Contains Link`
					// );
				}
			});
		}
	}
}
