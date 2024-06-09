import { Notice } from "obsidian";
import { getRichLinkTemplate } from "./getRichLinkTemplate";
import { sanitizeFileName } from "./sanitizeFileName";
import { handleTopicTagPages } from "./handleTopicTagPages";
import { checkIfLinkExistsInCache } from "./checkifLinkExistsInCache";
import ZettelBloom from "main";
import { saveResourceUrlCache } from "./saveResourceUrlCache";
import { getRaindrops } from "src/dataLayer/getRaindrops";
import { Bookmark, Item } from "types";
import { getBookmarkFromUrl } from "src/dataLayer/getBookmarkFromUrl";
import { addBookmarkToInbox } from "./addBookmarkToInbox";

export async function externalSync(plugin: ZettelBloom) {
	const { app, settings } = plugin;

	// fetches the raindrop items
	const raindrops: Item[] = await getRaindrops(plugin);

	// convert the raindrops to bookmarks
	const bookmarks: Bookmark[] = raindrops.map((raindrop) => {
		return {
			title: raindrop.title,
			source: raindrop.link,
			description: raindrop.excerpt,
			image: raindrop.cover,
			tags: raindrop.tags,
		};
	});

	// loop over bookmarks
	for (const bookmark of bookmarks) {
		const { source, tags } = bookmark;

		// if the urls exists in the cache, skip the bookmark
		if (
			checkIfLinkExistsInCache({
				link: source,
				resourceUrlCache: settings.resourceUrlCache,
			})
		) {
			// SKIP
			// SKIP
			// SKIP
			continue;
		}
		// save the url to the cache
		saveResourceUrlCache({
			link: source,
			plugin,
		});

		// get the title from the meta service

		const resolvedBookmark = await getBookmarkFromUrl(source);

		const { title, description } = resolvedBookmark || {};

		// the new file name is derived from the title of the bookmark
		const fileName = `${settings.resourceEmojiPrefix} ${
			sanitizeFileName(title) || sanitizeFileName(description || "")
		}`;

		// the folder path - customizable in the plugin settings
		const folderPath = settings.resourceFolderPath;

		// the file path - includes the folder path and the file name and extension
		const filePath = `${folderPath}/${fileName}.md`;

		// check if the file already exists
		const fileExists = app.vault.getAbstractFileByPath(filePath);

		if (fileExists) {
			// new Notice(`⚠️ ${newFileName} - Already exists`);
		} else {
			new Notice(`✅ ${fileName} - New File Created`);

			const content = getRichLinkTemplate(resolvedBookmark);
			await app.vault.create(filePath, content);

			// if we have tags
			if (tags?.length) {
				await handleTopicTagPages({
					settings,
					tags,
					fileName,
					app,
				});
			} else {
				// if we are not in a topic file we should add the bookmark to the inbox
				addBookmarkToInbox({
					plugin,
					fileName,
				});
			}
		}
	}
}

// OTHER RAINDROP API ENDPOINTS
// https://api.raindrop.io/rest/v1/backup/{ID}.{format}
//api.raindrop.io/rest/v1/collections

// const result = await window.fetch(`${BASEURL}/collections`, {
// 	method: "GET",
// 	headers: {
// 		Authorization: `Bearer ${TOKEN}`,
// 		"Content-Type": "application/json",
// 	},
// });

// const result = await window.fetch(`${BASEURL}/user`, {
// 	method: "GET",
// 	headers: {
// 		Authorization: `Bearer ${TOKEN}`,
// 		"Content-Type": "application/json",
// 	},
// });

// gets the collection metadatat
// const result = await window.fetch(
// 	`${BASEURL}/collection/${collectionId}`,
// 	{
// 		method: "GET",
// 		headers: {
// 			Authorization: `Bearer ${TOKEN}`,
// 			"Content-Type": "application/json",
// 		},
// 	}
// );
