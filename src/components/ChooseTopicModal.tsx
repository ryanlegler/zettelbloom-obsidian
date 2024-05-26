import { App, Modal } from "obsidian";
import { MetaData, ZettelBloomSettings } from "types";
import { createInPlace } from "src/utils/createInPlace";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { TopicTagPicker } from "./TopicTagPicker";

type ChooseTopicModalProps = {
	app: App;
	settings: ZettelBloomSettings;
	metadata: MetaData["metadata"];
	tagList: string[];
	suggested: string[];
};

export class ChooseTopicModal extends Modal {
	selectedOptions: Set<any>;
	settings: ZettelBloomSettings;
	root: Root | null = null;
	metadata: MetaData["metadata"];
	tagList: string[];
	suggested: string[];

	constructor({
		app,
		settings,
		metadata,
		tagList,
		suggested,
	}: ChooseTopicModalProps) {
		super(app);
		this.selectedOptions = new Set(); // stores the selected options
		this.settings = settings;
		this.metadata = metadata;
		this.suggested = suggested;
		this.tagList = tagList;
	}

	onConfirm = (tags: string[]) => {
		createInPlace({
			settings: this.settings,
			app: this.app,
			tags,
			metadata: this.metadata,
		});
		this.contentEl.empty();
		this.close();
	};

	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<TopicTagPicker
					tagList={this.tagList}
					suggested={this.suggested}
					onConfirm={this.onConfirm}
				/>
			</StrictMode>
		);
	}
}
