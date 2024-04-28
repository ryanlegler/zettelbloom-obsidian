import { App, Modal } from "obsidian";
import { ZettelBloomSettings } from "types";
import { createInPlace } from "src/utils/createInPlace";

export class ChooseTopicModal extends Modal {
	selectedOptions: Set<any>;
	settings: ZettelBloomSettings;

	constructor(app: App, settings: ZettelBloomSettings) {
		super(app);
		this.settings = settings;
		this.selectedOptions = new Set(); // stores the selected options
	}

	async onOpen() {
		let { contentEl } = this;

		const wrapper = contentEl.createDiv();
		wrapper.setCssStyles({
			maxHeight: "400px",
			overflow: "auto",
			margin: "15px 0",
		});

		wrapper.setText("Topic Tags:");

		const markdownFiles = this.app.vault.getMarkdownFiles();

		let topicTags = new Set();
		for (const file of markdownFiles) {
			if (file.path.startsWith(this.settings.resourceFolderPath)) {
				const cache = this.app.metadataCache.getFileCache(file);
				const tags = cache?.frontmatter?.topicTags; // assumes we are using the "topicTags" frontmatter for tags
				if (tags) {
					tags.forEach((tag: string) => {
						topicTags.add(tag);
					});
				}
			}
		}

		const tagOptions = Array.from(topicTags).map((tag) => {
			return {
				label: tag,
				value: tag,
			};
		}) as { label: string; value: string }[];

		const optionsDiv = wrapper.createDiv();
		optionsDiv.setCssStyles({
			display: "flex",
			flexDirection: "row",
			flexWrap: "wrap",
			paddingTop: "20px",
		});
		tagOptions.forEach((option) => {
			const innerOptionDiv = optionsDiv.createDiv();
			innerOptionDiv.setCssStyles({
				padding: "10px 10px 0 0",
				minWidth: "33.33%",
			});
			const checkbox = innerOptionDiv.createEl("input", {
				type: "checkbox",
			});
			checkbox.id = option.value;
			checkbox.onchange = () => {
				if (checkbox.checked) {
					this.selectedOptions.add(option.value);
				} else {
					this.selectedOptions.delete(option.value);
				}
			};

			const label = innerOptionDiv.createEl("label", {
				text: option.label,
			});
			label.setAttribute("for", option.value);
		});

		const submitButton = contentEl.createEl("button", {
			text: "Create Resource",
		});
		submitButton.onclick = () => {
			createInPlace({
				settings: this.settings,
				app: this.app,
				tags: Array.from(this.selectedOptions),
			});
			// do a thing based on the options selected
			this.close();
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
