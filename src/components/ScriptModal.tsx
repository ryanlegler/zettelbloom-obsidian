import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ScriptLauncher } from "./ScriptLauncher";
import { removeBookmarkWithoutTag } from "../utils/removeBookmarkWithoutTag";
import { removeTagFromBookmarks } from "../utils/removeTagFromBookmarks";
import { ZettelBloomSettings } from "types";
import { replaceTagInAllBookmarks } from "src/utils/replaceTagInAllBookmarks";

type Option = { label: string; value: string };

const options: Option[] = [
	{ label: "Remove Bookmark Without Tag", value: "removeBookmarkWithoutTag" },
	{ label: "Remove Tag From Bookmarks", value: "removeTagFromBookmarks" },
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
