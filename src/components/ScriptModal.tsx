import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ScriptLauncher } from "./ScriptLauncher";
import { ZettelBloomSettings } from "types";

// scripts
import { removeTagFromBookmarks } from "../scripts/removeTagFromBookmarks";
import { removeBookmarkWithoutTag } from "../scripts/removeBookmarkWithoutTag";
import { fetchMissingTopicTagsForFile } from "../scripts/fetchMissingTopicTagsForFile";
import { convertLinksToBookmarksForFile } from "../scripts/convertLinksToBookmarksForFile";
import { attachBookmarkToTopicTagFiles } from "src/scripts/attachBookmarkToTopicTagFiles";
import { removeDuplicateBookmarkOnFile } from "src/scripts/removeDuplicateBookmarkOnFile";
import { attachBookmarkToTopicTagForCurrentFile } from "src/scripts/attachBookmarkToTopicTagForCurrentFile";
import { removeSpaceBetweenBookmarksOnFile } from "src/scripts/removeSpaceBetweenBookmarksOnFile";
import { removeSpaceBetweenBookmarksAllFiles } from "src/scripts/removeSpaceBetweenBookmarksAllFiles";
import ZettelBloom from "main";
import { purgeBookmark } from "src/scripts/purgeBookmark";

type Option = {
	label: string;
	value: string;
	action: (plugin: ZettelBloom) => void;
};

const options: Option[] = [
	{
		label: "Remove Duplicate Bookmarks (From Current File)",
		value: "removeDuplicateBookmarkOnFile",
		action: removeDuplicateBookmarkOnFile,
	},
	{
		label: "Convert Links To Bookmarks (From Current File)",
		value: "convertLinksToBookmarksForFile",
		action: convertLinksToBookmarksForFile,
	},
	// {
	// 	label: "Remove Bookmark Without Tag (From Current File)",
	// 	value: "removeBookmarkWithoutTag",
	// 	action: removeBookmarkWithoutTag,
	// },
	{
		label: "Remove Tag From Bookmarks (From Current File)",
		value: "removeTagFromBookmarks",
		action: removeTagFromBookmarks,
	},
	// {
	// 	label: "Fetch Missing TopicTags (From Current File)",
	// 	value: "fetchMissingTopicTagsForFile",
	// 	action: fetchMissingTopicTagsForFile,
	// },
	{
		label: "Remove line Breaks Between Bookmarks (From Current File)",
		value: "removeSpaceBetweenBookmarksOnFile",
		action: removeSpaceBetweenBookmarksOnFile,
	},
	{
		label: "Purge (deletes Current Bookmark and removes all links to it)",
		value: "purgeBookmark",
		action: purgeBookmark,
	},
	// {
	// 	label: "Fetch Missing Metadata (All Files)",
	// 	value: "fetchMissingMetadata",
	// 	action: fetchMissingMetadata,
	// },
	// {
	// 	label: "Remove Duplicate Bookmarks (All Files)",
	// 	value: "removeDuplicateBookmarkOnAllFiles",
	// 	action: removeDuplicateBookmarkOnAllFiles,
	// },
	// {
	// 	label: "Convert To ZettelMark (All Files)",
	// 	value: "convertToZettelMark",
	// 	action: convertToZettelMark,
	// },
	// {
	// 	label: "Fetch Missing TopicTags (All Files)",
	// 	value: "fetchMissingTopicTags",
	// 	action: fetchMissingTopicTags,
	// },

	{
		label: "Attach Bookmark To TopicTag Files (Current File)",
		value: "attachBookmarkToTopicTagForCurrentFile",
		action: attachBookmarkToTopicTagForCurrentFile,
	},
	// {
	// 	label: "Attach Bookmark To TopicTag Files (All Files)",
	// 	value: "attachBookmarkToTopicTagFiles",
	// 	action: attachBookmarkToTopicTagFiles,
	// },
	// {
	// 	label: "Replace #gather with tag in all Bookmarks",
	// 	value: "replaceTagInAllBookmarks",
	// },
];

export class ScriptModal extends Modal {
	root: Root | null = null;
	options: Option[] = options;
	plugin: ZettelBloom;

	constructor(plugin: ZettelBloom) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onConfirm = (payload: string) => {
		options.find((option) => option.value === payload)?.action(this.plugin);
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
