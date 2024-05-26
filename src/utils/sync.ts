import { BASE_RAINDROP_MIRROR_URL, BASE_RAINDROP_URL } from "../constants";
import { App, Notice, TFile } from "obsidian";
import { mapResponseToMetadata } from "./mapResponseToMetadata";
import { ZettelBloomSettings } from "types";
import { getRichLinkTemplate } from "./getRichLinkTemplate";
import { sanitizeFileName } from "./sanitizeFileName";
import { sanitizeUrl } from "./sanitizeUrl";
import { handleTopicTagPages } from "./handleTopicTagPages";
import { cleanPermalink } from "./cleanPermalink";
import { checkIfLinkExistsInCache } from "./checkifLinkExistsInCache";
import ZettelBloom from "main";
import { saveResourceUrlCache } from "./saveResourceUrlCache";

export async function sync({
	settings,
	plugin,
	app,
	manualSync,
}: {
	settings: ZettelBloomSettings;
	app: App;
	plugin: ZettelBloom;
	manualSync?: boolean;
}) {
	// fetches the raindrop items
	const result = await window.fetch(
		`${BASE_RAINDROP_URL}/raindrops/${settings.raindropCollectionID}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${settings.raindropToken}`,
				"Content-Type": "application/json",
			},
		}
	);
	const data = await result.json();
	const { items } = data || {};

	// converts the items to metadata format
	const convertedItems: ReturnType<typeof mapResponseToMetadata>[] =
		items.map(mapResponseToMetadata);

	let fileExistCount = 0;

	// loop over converted items and call an async function for each one
	for (const convertedItem of convertedItems) {
		// for each item, check if it already exists in the mirrored data
		// const linkAlreadySaved = mirroredData.find(
		// 	(raindrop: any) => raindrop._id === convertedItem.raindropMeta._id
		// );

		const linkAlreadySaved = checkIfLinkExistsInCache({
			link: convertedItem?.raindropMeta?.link,
			resourceUrlCache: settings.resourceUrlCache,
		});

		// if the raindrop exists in the mirror, show a notice and continue to the next item
		if (linkAlreadySaved) {
			// new Notice(
			// 	`✅ ${convertedItem.raindropMeta.title} - Has been synced from another client`
			// );
			continue;
		}

		// getting the content for the new file
		const { metadata } = convertedItem || {};
		const { title, website } = metadata || {};

		// the new file name
		let newFileName = `${settings.resourceEmojiPrefix} ${
			sanitizeFileName(title) || sanitizeUrl(website)
		}`;

		// the folder path - customizable in the plugin settings
		let folderPath = settings.resourceFolderPath;

		// the file path - includes the folder path and the file name and extension
		const filePath = `${folderPath}/${newFileName}.md`;

		// check if the file already exists
		const fileExists = app.vault.getAbstractFileByPath(filePath);

		if (fileExists) {
			// new Notice(`⚠️ ${newFileName} - Already exists`);
			fileExistCount += 1;
		} else {
			saveResourceUrlCache({
				link: website,
				plugin,
			});

			new Notice(`✅ ${newFileName} - New File Created`);

			// if we have tags
			if (convertedItem.tags?.length) {
				// creates the new file
				const content = getRichLinkTemplate({
					metadata,
					tags: convertedItem.tags,
				});
				await app.vault.create(filePath, content);

				await handleTopicTagPages({
					settings,
					tags: convertedItem.tags,
					newFileName,
					app,
				});
			} else {
				// creates the new file
				const content = getRichLinkTemplate({
					metadata,
					tags: convertedItem.tags,
					hashtag: "#propagate",
				});
				await app.vault.create(filePath, content);

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
	}

	if (fileExistCount && manualSync) {
		new Notice(`✅ ${fileExistCount} Files already exist`);
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
