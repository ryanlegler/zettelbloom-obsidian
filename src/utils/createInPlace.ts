import { App, Notice, TFile } from "obsidian";
import { MetaData, ZettelBloomSettings } from "types";
import { getRichLinkTemplate } from "./getRichLinkTemplate";
import { handleTopicTagPages } from "./handleTopicTagPages";
import { extractUrlFromMarkdown } from "./extractUrlFromMarkdown";
import { checkIfFileExists } from "./checkifFileExists";
import { getIsValidUrl } from "./getIsValidUrl";
import { backSync } from "./backSync";
import { checkIfLinkExistsInCache } from "./checkifLinkExistsInCache";

export async function createInPlace({
	settings,
	app,
	tags = [],
	metadata,
	propagate = true,
}: {
	settings: ZettelBloomSettings;
	app: App;
	tags: string[];
	metadata: MetaData["metadata"];
	propagate?: boolean;
}) {
	const selection = app.workspace.activeEditor?.editor?.getSelection();
	const url = extractUrlFromMarkdown(selection);

	// url should already be validated in the picker - we are checking again just in case
	if (!url || !getIsValidUrl(url)) {
		new Notice(`🚨 No URL Found in Selection`);
		return;
	}

	const { title, website } = metadata || {};

	const linkAlreadySaved = checkIfLinkExistsInCache({
		link: metadata.website,
		resourceUrlCache: settings.resourceUrlCache,
	});

	const { fileExists, newFileName, filePath } = await checkIfFileExists({
		app,
		settings,
		title: title,
		website: website,
	});

	// this should now never happen because we are checking if the file exists before calling this function.
	// just incase we missed something, we will check again
	if (fileExists || linkAlreadySaved) {
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
			await backSync({
				url,
				settings,
				metadata,
			});
		}

		// creates the new file
		const content = getRichLinkTemplate({
			metadata,
			tags,
			hashtag: "",
		});

		await app.vault.create(filePath, content);
		new Notice(`✅ ${newFileName} - New File Created`);

		if (propagate) {
			// if we have tags
			if (tags?.length) {
				await handleTopicTagPages({
					settings,
					tags, // tags from the metadata
					newFileName, // the name of the bookmark file
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
		}

		// now put the link in the current selection in the editor
		app.workspace.activeEditor?.editor?.replaceSelection(
			`![[${newFileName}]]`
		);
	}
}
