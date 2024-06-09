import { App, Modal } from "obsidian";
import { Bookmark, ZettelBloomSettings } from "types";
import { createInPlace } from "src/utils/createInPlace";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { TopicTagPicker } from "./TopicTagPicker";
import ZettelBloom from "main";

type ChooseTopicModalProps = {
	plugin: ZettelBloom;
	bookmark: Bookmark;
	tagList: string[];
	suggested: string[];
};

export class ChooseTopicModal extends Modal {
	selectedOptions: Set<any>;
	plugin: ZettelBloom;
	root: Root | null = null;
	bookmark: Bookmark;
	tagList: string[];
	suggested: string[];

	constructor({
		plugin,
		bookmark,
		tagList,
		suggested,
	}: ChooseTopicModalProps) {
		super(plugin.app);
		this.selectedOptions = new Set(); // stores the selected options
		this.plugin = plugin;
		this.bookmark = bookmark;
		this.suggested = suggested;
		this.tagList = tagList;
	}

	onConfirm = (tags: string[]) => {
		createInPlace({
			plugin: this.plugin,
			tags,
			bookmark: this.bookmark,
		});
		this.contentEl.empty();
		this.close();
	};

	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<TopicTagPicker
					tags={[]}
					tagList={this.tagList}
					bookmark={this.bookmark}
					onConfirm={this.onConfirm}
				/>
			</StrictMode>
		);
	}
}
