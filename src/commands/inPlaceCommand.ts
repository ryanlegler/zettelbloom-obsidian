import ZettelBloom from "main";
import { App, Notice, TAbstractFile, TFile } from "obsidian";
import { ChooseTopicModal } from "src/components/ChooseTopicModal";
import { backSync } from "src/utils/backSync";
import { checkIfFileExists } from "src/utils/checkifFileExists";
import { checkIfLinkExistsInCache } from "src/utils/checkifLinkExistsInCache";
import { cleanPermalink } from "src/utils/cleanPermalink";
import { createInPlace } from "src/utils/createInPlace";
import { extractUrlFromMarkdown } from "src/utils/extractUrlFromMarkdown";
import { getIsValidUrl } from "src/utils/getIsValidUrl";
import { getMetaData } from "src/utils/getMetaData";
import { getRichLinkTemplate } from "src/utils/getRichLinkTemplate";
import { getTopicTagSet } from "src/utils/getTopicTagSet";
import { saveResourceUrlCache } from "src/utils/saveResourceUrlCache";
import { MetaData } from "types";

export async function inPlaceCommand({ plugin }: { plugin: ZettelBloom }) {
	const { settings, app } = plugin;
	const selection = app.workspace.activeEditor?.editor?.getSelection();
	const lines = selection?.split("\n").filter(Boolean);
	const urls = lines?.map((line) => extractUrlFromMarkdown(line)) || [];

	const links = [];

	for (const url of urls) {
		if (!url || !getIsValidUrl(url)) {
			new Notice(`🚨 No URL Found in Selection`);
			continue;
		}
		const metadata: MetaData["metadata"] = await getMetaData(url);

		const { fileExists, newFileName, filePath } = await checkIfFileExists({
			settings,
			title: metadata.title,
			website: metadata.website,
			app,
		});

		const tagList = getTopicTagSet({
			files: app.vault.getMarkdownFiles(),
			resourceFolderPath: settings.resourceFolderPath,
		});

		const linkAlreadySaved = checkIfLinkExistsInCache({
			link: metadata.website,
			resourceUrlCache: settings.resourceUrlCache,
		});

		if (fileExists || linkAlreadySaved) {
			const file = app.vault.getAbstractFileByPath(filePath) as TFile;

			if (file) {
				const frontmatter =
					app.metadataCache.getFileCache(file)?.frontmatter;

				if (frontmatter?.source !== metadata?.website) {
					// fo a find by link
					const file = app.vault.getMarkdownFiles().find((file) => {
						const frontmatter =
							app.metadataCache.getFileCache(file)?.frontmatter;
						return frontmatter?.source === metadata?.website;
					});

					if (file) {
						new Notice(
							`🚨 File Already Exists: "${file.basename}"`
						);
						// put the link in the current selection in the editor
						links.push(`![[${file.basename}]]`);
						continue;
					}
				}
			}

			new Notice(`🚨 File Already Exists: "${metadata.title}"`);
			// put the link in the current selection in the editor
			links.push(`![[${newFileName}]]`); // TODO this could be a filename that is actually related to a different URL - that just had the same title....
			continue;
		} else {
			// TODO account for other emoji prefixes
			// get current file
			// use the title of the file as the tag - if it's one of the topic tags

			const file = app.workspace.getActiveFile();
			const title = file?.basename?.replace("🏷️ ", "") || "";
			const fileTag =
				(Array.from(tagList).includes(title) && [title]) || [];

			if (fileTag.length) {
				if (settings.raindropBackSync) {
					await backSync({
						url,
						settings,
					});
				}

				// creates the new file
				const content = getRichLinkTemplate({
					metadata,
					tags: fileTag,
					hashtag: "",
				});

				await app.vault.create(filePath, content);
				links.push(`![[${newFileName}]]`);

				saveResourceUrlCache({
					link: metadata.website,
					plugin,
				});

				// we are in a topic tag page - we don't want to propagate the link
				// const link = createInPlace({
				// 	app,
				// 	settings,
				// 	metadata,
				// 	tags: fileTag,
				// 	propagate: false, // we don't want to propagate the link - we are already adding it in place and are in a topic tag page
				// });
			} else {
				const { title } = metadata || {};
				const response = await fetch(
					`https://zettelbloom-api.vercel.app/api/getTopicTagMatch`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							metadata: metadata,
							tagList: Array.from(tagList),
						}),
					}
				);
				new Notice(`Fetched Topic Tags for ${title}`);

				const suggested = await response.json();

				new ChooseTopicModal({
					app,
					settings,
					metadata,
					tagList: Array.from(tagList),
					suggested,
				}).open();

				// TODO handle the async case here - the ChooseTopicModal internally calls createInPlace which handle it's own selection - maybe this is okay but this will only work with single selection....
				// SO if you have multiple selections - you will only get the last one in the case that you aren't in a topic tag page
			}
		}
	}

	console.log("🚀 ~ links:", links);
	if (links.length) {
		const linksStrings = links.join("\n\n");
		app.workspace.activeEditor?.editor?.replaceSelection(linksStrings);
	}
}
