import ZettelBloom from "main";
import { App, Notice, TFile } from "obsidian";
import { backSync } from "src/utils/backSync";
import { checkIfFileExists } from "src/utils/checkifFileExists";
import { checkIfLinkExistsInCache } from "src/utils/checkifLinkExistsInCache";
import { extractUrlFromMarkdown } from "src/utils/extractUrlFromMarkdown";
import { getIsValidUrl } from "src/utils/getIsValidUrl";
import { getMetaData } from "src/utils/getMetaData";
import { getRichLinkTemplate } from "src/utils/getRichLinkTemplate";
import { getTopicTagSet } from "src/utils/getTopicTagSet";
import { saveResourceUrlCache } from "src/utils/saveResourceUrlCache";
import { MetaData } from "types";

export async function convertLinksToBookmarksForFile(plugin: ZettelBloom) {
	const { settings, app } = plugin;

	// get current file
	const file = app.workspace.getActiveFile();

	if (!file) {
		new Notice(`🚨 No File Open`);
		return;
	}

	const tagList = getTopicTagSet({
		files: app.vault.getMarkdownFiles(),
		resourceFolderPath: settings.resourceFolderPath,
	});

	// account for other emoji prefixes
	const title = file?.basename?.replace("🏷️ ", "") || "";

	// use the title of the file as the tag - if it's one of the topic tags
	// TODO - ability to choose the tag to use....
	const tags = (Array.from(tagList).includes(title) && [title]) || [];

	const contents = await app.vault.cachedRead(file as TFile);
	// find all regular html links of markdown links in the content of the file
	const linkSelections =
		contents.match(/\[.*?\]\((.*?)\)|(https?:\/\/[^\s]+)/g) || [];

	for (const selection of linkSelections) {
		const url = extractUrlFromMarkdown(selection);

		// url should already be validated in the picker - we are checking again just in case
		if (!url || !getIsValidUrl(url)) {
			new Notice(`🚨 No URL Found in Selection`);
			return;
		}

		const metadata: MetaData["metadata"] = await getMetaData(url);

		const { title, website } = metadata || {};

		const linkAlreadySaved = checkIfLinkExistsInCache({
			link: metadata.website,
			resourceUrlCache: settings.resourceUrlCache,
		});

		const { fileExists, newFileName, filePath } = await checkIfFileExists({
			app,
			settings,
			title,
			website,
		});

		app.vault.read(file).then((currentContent) => {
			// Add a link to the Bookmark at each link selection
			const newContent = currentContent.replace(
				selection,
				`![[${newFileName}]]`
			);
			app.vault.modify(file, newContent);
		});

		// this is the bookmark for each selection
		// if the file already exists, we will just add the link to the file

		if (fileExists || linkAlreadySaved) {
			new Notice(`🚨 File Already Exists: "${newFileName}"`);
		} else {
			// if the file doesn't exist, we will create a new file
			// creates the new file
			const content = getRichLinkTemplate({
				metadata,
				tags,
				hashtag: "",
			});

			await app.vault.create(filePath, content);

			saveResourceUrlCache({
				link: website,
				plugin,
			});
			new Notice(`✅ ${newFileName} - New File Created`);

			if (settings.raindropBackSync) {
				await backSync({
					url,
					settings,
					metadata,
				});
			}

			if (!tags?.length) {
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
}
