import { App, Modal } from "obsidian";
import { ZettelBloomSettings } from "types";
import { createInPlace } from "src/utils/createInPlace";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { TopicTagPicker } from "./components/TopicTagPicker";

export class ChooseTopicModal extends Modal {
	selectedOptions: Set<any>;
	settings: ZettelBloomSettings;
	root: Root | null = null;

	constructor(app: App, settings: ZettelBloomSettings) {
		super(app);
		this.settings = settings;
		this.selectedOptions = new Set(); // stores the selected options
	}

	onConfirm = (tags: string[]) => {
		console.log("🚀 TAGS:", tags);
		createInPlace({
			settings: this.settings,
			app: this.app,
			tags,
		});

		const { contentEl } = this;
		contentEl.empty();
		this.close();
	};

	async onOpen() {
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
