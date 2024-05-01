import { App, Modal } from "obsidian";
import { MetaData, ZettelBloomSettings } from "types";
import { createInPlace } from "src/utils/createInPlace";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { TopicTagPicker } from "./components/TopicTagPicker";

export class ChooseTopicModal extends Modal {
	selectedOptions: Set<any>;
	settings: ZettelBloomSettings;
	root: Root | null = null;
	metadata: MetaData["metadata"];

	constructor(
		app: App,
		settings: ZettelBloomSettings,
		metadata: MetaData["metadata"]
	) {
		super(app);
		this.settings = settings;
		this.selectedOptions = new Set(); // stores the selected options
		this.metadata = metadata;
	}

	onConfirm = (tags: string[]) => {
		createInPlace({
			settings: this.settings,
			app: this.app,
			tags,
			metadata: this.metadata,
		});

		const { contentEl } = this;
		contentEl.empty();
		this.close();
	};

	async onOpen() {
		//
		let { contentEl } = this;
		// const wrapper = contentEl.createDiv();

		this.root = createRoot(contentEl);
		this.root.render(
			<StrictMode>
				<TopicTagPicker
					app={this.app}
					settings={this.settings}
					onConfirm={this.onConfirm}
				/>
			</StrictMode>
		);
	}
}
