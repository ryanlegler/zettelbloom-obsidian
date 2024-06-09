import { App, Notice, TFile } from "obsidian";
import { sanitizeFileName } from "./sanitizeFileName";
import { ZettelBloomSettings } from "types";

export async function handleTopicTagPages({
	tags,
	fileName,
	app,
	settings,
	devTopicFilePaths,
}: {
	tags: string[];
	fileName: string;
	app: App;
	settings: ZettelBloomSettings;
	devTopicFilePaths?: string[];
}) {
	// the tags are the topic tags per file
	for (const tag of tags) {
		const devTopicFileName = `🏷️ ${sanitizeFileName(tag)}`;
		const devTopicPath = `${settings.devTopicFolderPath}/${devTopicFileName}.md`;

		// get the File object for the dev topic file path
		const devTopicFile = app.vault.getAbstractFileByPath(
			devTopicPath
		) as TFile;

		console.log("🚀 ~ devTopicFile:", devTopicFile);

		// create the dev topic file if it doesn't exist
		if (!devTopicFile) {
			// console.log("🚀 ~ devTopicPath:", devTopicPath);
			// new Notice(`🚫 devTopicFile for path "${devTopicPath}" Not found`);
			// new Notice(`✅ New Dev Topic File: "${devTopicFileName}" Created`);
			// // TODO - maybe the uplink should be optional
			// const content = `\nup: [[${settings.devTopicUpLinkPath}]]\n\n![[${newFileName}]]\n\n`;
			// await app.vault.create(devTopicPath, content);
		} else {
			// add the link to the dev topic file

			await app.vault.read(devTopicFile).then((currentContent) => {
				console.log(
					"🚀 ~ awaitapp.vault.read ~ currentContent:",
					currentContent
				);

				const alreadyIncluded = currentContent.includes(
					`![[${fileName}]]`
				);
				// Add a link to the Bookmark at each link selection if it doesn't already exist
				if (!alreadyIncluded) {
					new Notice(
						`✅ Dev Topic File: "${devTopicFileName}" Updated`
					);
					app.vault.modify(
						devTopicFile,
						currentContent + `![[${fileName}]] \n \n`
					);

					// we should also remove the propagate link from the bookmark file
				} else {
					new Notice(
						`🚫 Dev Topic File: "${devTopicFileName}" Already Contains Link`
					);
				}
			});
		}
	}
}
