import { App, Notice, TFile } from "obsidian";
import { MetaData, ZettelBloomSettings } from "types";
import { getTopicTagYaml } from "./getTopicTagYaml";
import { checkIfFileExists } from "./checkifFileExists";
import { handleTopicTagPages } from "./handleTopicTagPages";

export async function processTopicTagForFile({
	metadata,
	tagList,
	file,
	settings,
	app,
}: {
	metadata?: {
		title?: string;
		source?: string;
		website?: string;
	};
	settings: ZettelBloomSettings;
	tagList: Set<string>;
	file: TFile;
	app: App;
}) {
	const contents = await app.vault.cachedRead(file);

	const { title, website } = metadata || {};
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

	const topicTags = await response.json();

	if (!topicTags.length) {
		new Notice(`No Topic Tags found for ${title}`);
		return;
	}
	const resolvedTopicTagsYaml = getTopicTagYaml(topicTags);

	const newContents = contents
		.replace("topicTags: ", "topicTags:")
		.replace("topicTags:", resolvedTopicTagsYaml);

	// now we are updating the file with the new topic tags
	app.vault
		.modify(file, newContents)
		.then(() => {
			console.log("Content added to the file successfully.");
			new Notice(
				`${JSON.stringify(topicTags)} added to the file successfully.`
			);
		})
		.catch((err) => {
			console.error("Error modifying file:", err);
		});

	// now we are creating a new link in each topic tag page / will also create the topic tag page if it doesn't exist
	const { newFileName } = await checkIfFileExists({
		app,
		settings,
		title: title || "",
		website: website || "",
	});

	await handleTopicTagPages({
		settings,
		tags: topicTags,
		newFileName,
		app,
	});
}
