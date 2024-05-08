import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ScriptLauncher } from "./ScriptLauncher";
import { ZettelBloomSettings } from "types";

import { removeTagFromBookmarks } from "../scripts/removeTagFromBookmarks";
import { removeBookmarkWithoutTag } from "../scripts/removeBookmarkWithoutTag";
import { replaceTagInAllBookmarks } from "../scripts/replaceTagInAllBookmarks";
import { fetchMissingMetadata } from "../scripts/fetchMissingMetadata";
import { convertToZettelMark } from "../scripts/convertToZettelMark";
import { fetchMissingTopicTags } from "../scripts/fetchMissingTopicTags";
import { fetchMissingTopicTagsForFile } from "../scripts/fetchMissingTopicTagsForFile";
import { convertLinksToBookmarksForFile } from "../scripts/convertLinksToBookmarksForFile";
import { attachBookmarkToTopicTagFiles } from "src/scripts/attachBookmarkToTopicTagFiles";

type Option = { label: string; value: string };

const options: Option[] = [
	{
		label: "Convert Links To Bookmarks (From Current File)",
		value: "convertLinksToBookmarksForFile",
	},
	{
		label: "Remove Bookmark Without Tag (From Current File)",
		value: "removeBookmarkWithoutTag",
	},
	{
		label: "Remove Tag From Bookmarks (From Current File)",
		value: "removeTagFromBookmarks",
	},
	{
		label: "Fetch Missing Metadata (All Files)",
		value: "fetchMissingMetadata",
	},
	{
		label: "Convert To ZettelMark (All Files)",
		value: "convertToZettelMark",
	},
	{
		label: "Fetch Missing TopicTags (All Files)",
		value: "fetchMissingTopicTags",
	},
	{
		label: "Fetch Missing TopicTags (From Current File)",
		value: "fetchMissingTopicTagsForFile",
	},
	{
		label: "Attach Bookmark To TopicTag Files (All Files)",
		value: "attachBookmarkToTopicTagFiles",
	},

	// {
	// 	label: "Replace #gather with tag in all Bookmarks",
	// 	value: "replaceTagInAllBookmarks",
	// },
];

type FunctionMapType = Record<
	string,
	({ app, settings }: { app: App; settings: ZettelBloomSettings }) => void
>;

const functionMap: FunctionMapType = {
	removeBookmarkWithoutTag,
	removeTagFromBookmarks,
	replaceTagInAllBookmarks,
	fetchMissingMetadata,
	convertToZettelMark,
	fetchMissingTopicTags,
	fetchMissingTopicTagsForFile,
	convertLinksToBookmarksForFile,
	attachBookmarkToTopicTagFiles,
};

export class ScriptModal extends Modal {
	root: Root | null = null;
	options: Option[] = options;
	settings: ZettelBloomSettings;

	constructor(app: App, settings: ZettelBloomSettings) {
		super(app);
		this.settings = settings;
	}

	onConfirm = (payload: string) => {
		functionMap[payload]?.({ app: this.app, settings: this.settings });
		this.contentEl.empty();
		this.close();
	};

	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<ScriptLauncher options={options} onConfirm={this.onConfirm} />
			</StrictMode>
		);
	}
}
