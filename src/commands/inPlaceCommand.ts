import ZettelBloom from "main";
import { Notice } from "obsidian";

import { getBookmarkFromUrl } from "src/dataLayer/getBookmarkFromUrl";
import { addBookmarkToInbox } from "src/utils/addBookmarkToInbox";

import { checkIfLinkExistsInCache } from "src/utils/checkifLinkExistsInCache";
import { getIsTopicTagFile } from "src/utils/getIsTopicTagFile";
import { getIsValidUrl } from "src/utils/getIsValidUrl";
import { getResolvedFileName } from "src/utils/getResolvedFileName";

import { getRichLinkTemplate } from "src/utils/getRichLinkTemplate";
import { getUrlsFromSelection } from "src/utils/getUrlsFromSelection";
import { lookupFileName } from "src/utils/lookupFileName";
import { replaceAndSelectLoading } from "src/utils/replaceAndSelectLoading";
import { saveResourceUrlCache } from "src/utils/saveResourceUrlCache";
import { Bookmark } from "types";

export async function inPlaceCommand({ plugin }: { plugin: ZettelBloom }) {
	const { settings, app } = plugin;
	const selection = app.workspace.activeEditor?.editor?.getSelection();

	const urls = getUrlsFromSelection(selection || "");

	replaceAndSelectLoading(plugin);

	// these are the links the the bookmarked resources we are going to replace the current selection with
	const bookmarkLinks = [];

	for (const url of urls) {
		// is the url even valid
		if (!url || !getIsValidUrl(url)) {
			continue;
		}

		// is the link already saved in the cache
		const linkAlreadySaved = checkIfLinkExistsInCache({
			link: url,
			resourceUrlCache: settings.resourceUrlCache,
		});

		// fetch the bookmark metadata
		const bookmark: Bookmark = await getBookmarkFromUrl(url);

		if (linkAlreadySaved) {
			// if the link is already saved we should lookup the correct file path by the source of the bookmark
			const { fileName } = await lookupFileName({
				plugin,
				bookmark,
			});

			new Notice(`🚨 File Already Exists: "${bookmark.title}"`);
			// put the link in the current selection in the editor
			bookmarkLinks.push(`![[${fileName}]]`); // TODO this could be a filename that is actually related to a different URL - that just had the same title....
			continue;
		} else {
			await saveResourceUrlCache({
				link: url,
				plugin,
			});

			// we use the getResolvedFileName when we want to be sure we are returning a file path that is unique
			const { fileName, filePath } = await getResolvedFileName({
				plugin,
				bookmark,
			});

			// creates the new file
			const content = getRichLinkTemplate(bookmark);
			await app.vault.create(filePath, content);

			new Notice(`✅ ${fileName} - New File Created`);

			if (!getIsTopicTagFile(plugin)) {
				// if we are not in a topic file we should add the bookmark to the inbox
				addBookmarkToInbox({
					plugin,
					fileName,
				});
			}
			bookmarkLinks.push(`![[${fileName}]]`);
		}
	}

	if (bookmarkLinks.length) {
		app.workspace.activeEditor?.editor?.replaceSelection(
			bookmarkLinks.join("\n\n")
		);
	}
}
