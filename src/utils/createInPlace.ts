import { App, Notice, TFile } from "obsidian";
import { Bookmark, ZettelBloomSettings } from "types";
import { getRichLinkTemplate } from "./getRichLinkTemplate";
import { handleTopicTagPages } from "./handleTopicTagPages";
import { extractUrlFromMarkdown } from "./extractUrlFromMarkdown";
import { checkIfFileExists } from "./checkifFileExists";
import { getIsValidUrl } from "./getIsValidUrl";
import { backSync } from "./backSync";
import { checkIfLinkExistsInCache } from "./checkifLinkExistsInCache";
import ZettelBloom from "main";
import { getResolvedFileName } from "./getResolvedFileName";

// TODO - this isn't actually used anymore - get rid of it?
export async function createInPlace({
	plugin,
	tags = [],
	bookmark,
	propagate = true,
}: {
	plugin: ZettelBloom;
	tags: string[];
	bookmark: Bookmark;
	propagate?: boolean;
}) {
	const { settings, app } = plugin;
	const selection = app.workspace.activeEditor?.editor?.getSelection();
	const url = extractUrlFromMarkdown(selection);

	// url should already be validated in the picker - we are checking again just in case
	if (!url || !getIsValidUrl(url)) {
		new Notice(`🚨 No URL Found in Selection`);
		return;
	}

	const { title, source } = bookmark || {};

	const linkAlreadySaved = checkIfLinkExistsInCache({
		link: source,
		resourceUrlCache: settings.resourceUrlCache,
	});

	// we use the getResolvedFileName when we want to be sure we are returning a file path that is unique
	const { fileName, filePath } = await getResolvedFileName({
		plugin,
		bookmark,
	});

	// this should now never happen because we are checking if the file exists before calling this function.
	// just incase we missed something, we will check again
	if (linkAlreadySaved) {
		new Notice(`🚨 File Already Exists: "${fileName}"`);
		// put the link in the current selection in the editor
		app.workspace.activeEditor?.editor?.replaceSelection(
			`![[${fileName}]]`
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
			});
		}

		// creates the new file
		const content = getRichLinkTemplate(bookmark);
		await app.vault.create(filePath, content);

		new Notice(`✅ ${fileName} - New File Created`);

		if (propagate) {
			// if we have tags
			if (tags?.length) {
				await handleTopicTagPages({
					settings,
					tags, // tags from the metadata
					fileName, // the name of the bookmark file
					app,
				});
			} else {
				const inboxFile = app.vault.getAbstractFileByPath(
					settings.resourceInboxFilePath
				) as TFile;
				const file = app.workspace.getActiveFile();
				const inboxIsActive = inboxFile.path === file?.path;
				// if we don't have tags, add the link to the Inbox
				// don't add it to the inbox is the file is the inbox
				if (inboxFile && !inboxIsActive) {
					app.vault.read(inboxFile).then((currentContent) => {
						app.vault.modify(
							inboxFile,
							currentContent + `![[${fileName}]] \n \n`
						);
					});
				}
			}
		}

		// now put the link in the current selection in the editor
		app.workspace.activeEditor?.editor?.replaceSelection(
			`![[${fileName}]]`
		);
	}
}
