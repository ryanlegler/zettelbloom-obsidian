import { App, Notice, TFile } from "obsidian";
import { MetaData, RainDropMeta, ZettelBloomSettings } from "types";
import { getRichLinkTemplate } from "./getRichLinkTemplate";
import { handleTopicTagPages } from "./handleTopicTagPages";
import { extractUrlFromMarkdown } from "./extractUrlFromMarkdown";
import { saveToRaindrop } from "./saveToRaindrop";
import { BASE_RAINDROP_MIRROR_URL } from "../constants";
import { checkIfFileExists } from "./checkifFileExists";

export async function createInPlace({
	settings,
	app,
	tags = [],
	metadata,
}: {
	settings: ZettelBloomSettings;
	app: App;
	tags: string[];
	metadata: MetaData["metadata"];
}) {
	const selection = app.workspace.activeEditor?.editor?.getSelection();
	const url = extractUrlFromMarkdown(selection);

	const { title, website } = metadata || {};

	const { fileExists, newFileName, filePath } = checkIfFileExists({
		settings: this.settings,
		title: title,
		website: website,
		app: this.app,
	});

	// this should now never happen because we are checking if the file exists before calling this function.
	// just incase we missed something, we will check again
	if (fileExists) {
		new Notice(`🚨 File Already Exists: "${newFileName}"`);
		// put the link in the current selection in the editor
		app.workspace.activeEditor?.editor?.replaceSelection(
			`![[${newFileName}]]`
		);

		return;
	} else {
		if (!settings.raindropToken || !settings.raindropCollectionID) {
			new Notice(`MISSING CONFIG`);
			return;
		}

		if (settings.raindropBackSync) {
			// save it to Raindrop
			const raindrop = await saveToRaindrop({
				url,
				collectionID: settings.raindropCollectionID,
				token: settings.raindropToken,
			});

			if (settings.duplicatePrevention) {
				const metadataMapped: Partial<RainDropMeta> = {
					link: url,
					title,
					cover: metadata?.banner,
					excerpt: metadata?.description,
					created: new Date().toISOString(),
					lastUpdate: new Date().toISOString(),
					tags: "",
					collectionId: parseInt(settings.raindropCollectionID, 10),
					_id: raindrop?._id,
				};
				// Adds it to turso Mirror if it doesn't exist
				await fetch(`${BASE_RAINDROP_MIRROR_URL}/raindrop`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(metadataMapped),
				});
			}
		}

		// creates the new file
		const content = getRichLinkTemplate({
			metadata,
			tags,
			hashtag: "",
		});

		await app.vault.create(filePath, content);
		new Notice(`✅ ${newFileName} - New File Created`);

		// if we have tags
		if (tags?.length) {
			await handleTopicTagPages({
				settings,
				tags,
				newFileName,
				app,
			});
		} else {
			// if we don't have tags, add the link to the Inbox
			let inboxFile: TFile = app.vault.getAbstractFileByPath(
				settings.resourceInboxFilePath
			) as TFile;

			if (inboxFile) {
				app.vault.read(inboxFile).then((currentContent) => {
					app.vault.modify(
						inboxFile,
						currentContent + `![[${newFileName}]] \n \n`
					);
				});
			}
		}

		// now put the link in the current selection in the editor
		app.workspace.activeEditor?.editor?.replaceSelection(
			`![[${newFileName}]]`
		);
	}
}
