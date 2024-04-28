import { App, Notice, TFile } from "obsidian";
import { MetaData, RainDropMeta, ZettelBloomSettings } from "types";
import { getRichLinkTemplate } from "./getRichLinkTemplate";
import { sanitizeFileName } from "./sanitizeFileName";
import { sanitizeUrl } from "./sanitizeUrl";
import { handleTopicTagPages } from "./handleTopicTagPages";
import { extractUrlFromMarkdown } from "./extractUrlFromMarkdown";
import { getMetaData } from "./getMetaData";
import { saveToRaindrop } from "./saveToRaindrop";
import { BASE_RAINDROP_MIRROR_URL } from "../constants";

export async function createInPlace({
	settings,
	app,
	tags = [],
}: {
	settings: ZettelBloomSettings;
	app: App;
	tags: string[];
}) {
	const selection = app.workspace.activeEditor?.editor?.getSelection();

	const url = extractUrlFromMarkdown(selection);
	const metadata: MetaData["metadata"] = await getMetaData(url);

	const { title, website } = metadata || {};

	// the new file name
	let newFileName = `🔗 ${sanitizeFileName(title) || sanitizeUrl(website)}`;

	const { resourceFolderPath } = settings;

	// the file path - includes the folder path and the file name and extension
	const filePath = `${resourceFolderPath}/${newFileName}.md`;

	// check if the file already exists
	const fileExists = app.vault.getAbstractFileByPath(filePath);

	if (fileExists) {
		new Notice(`🚨 File Already Exists: "${newFileName}"`);
		return;
	} else {
		// save it to Raindrop
		const raindrop = await saveToRaindrop({
			url,
			collectionID: settings.collectionID,
			token: settings.token,
		});

		const metadataMapped: Partial<RainDropMeta> = {
			link: url,
			title,
			cover: metadata?.banner,
			excerpt: metadata?.description,
			created: new Date().toISOString(),
			lastUpdate: new Date().toISOString(),
			tags: "",
			collectionId: parseInt(settings.collectionID, 10),
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
