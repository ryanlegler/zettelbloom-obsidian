import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ScriptLauncher } from "./ScriptLauncher";
// scripts
import { convertLinksToBookmarksForFile } from "../scripts/convertLinksToBookmarksForFile";
import { removeDuplicateBookmarkOnFile } from "src/scripts/removeDuplicateBookmarkOnFile";
import { removeSpaceBetweenBookmarksOnFile } from "src/scripts/removeSpaceBetweenBookmarksOnFile";
import ZettelBloom from "main";

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
	{
		label: "Remove line Breaks Between Bookmarks (From Current File)",
		value: "removeSpaceBetweenBookmarksOnFile",
		action: removeSpaceBetweenBookmarksOnFile,
	},
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
