import { BASE_RAINDROP_MIRROR_URL, BASE_RAINDROP_URL } from "../constants";
import { App, Notice, TFile } from "obsidian";
import { mapResponseToMetadata } from "./mapResponseToMetadata";
import { ZettelBloomSettings } from "types";
import { getRichLinkTemplate } from "./getRichLinkTemplate";
import { sanitizeFileName } from "./sanitizeFileName";
import { sanitizeUrl } from "./sanitizeUrl";
import { handleTopicTagPages } from "./handleTopicTagPages";

export async function sync({
	settings,
	app,
	manualSync,
}: {
	settings: ZettelBloomSettings;
	app: App;
	manualSync?: boolean;
}) {
	// fetches the raindrop items
	const result = await window.fetch(
		`${BASE_RAINDROP_URL}/raindrops/${settings.collectionID}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${settings.token}`,
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

	// Get the mirrored drops from the turso mirror
	const mirroredResponse = await fetch(
		`${BASE_RAINDROP_MIRROR_URL}/raindrops`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	const mirroredData = await mirroredResponse.json();

	// loop over converted items and call an async function for each one
	for (const convertedItem of convertedItems) {
		// for each item, check if it already exists in the mirrored data
		const raindropExists = mirroredData.find(
			(raindrop: any) => raindrop._id === convertedItem.raindropMeta._id
		);

		// if the raindrop exists in the mirror, show a notice and continue to the next item
		if (raindropExists) {
			// new Notice(
			// 	`✅ ${convertedItem.raindropMeta.title} - Has been synced from another client`
			// );
			continue;
		}

		// getting the content for the new file
		const { metadata } = convertedItem || {};
		const { title, website } = metadata || {};

		// the new file name
		let newFileName = `🔗 ${
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
			// Adds it to turso Mirror if it doesn't exist

			await fetch(`https://raindrop-sync.vercel.app/api/raindrop`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(convertedItem.raindropMeta),
			});

			// await tp.file.create_new(content, newFileName, false, folder);
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
