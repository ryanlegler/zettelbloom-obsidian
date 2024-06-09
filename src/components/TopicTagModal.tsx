import { App, Modal, TFile } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";

import ZettelBloom from "main";
import { TopicTagPicker } from "./TopicTagPicker";
import { handleTopicTagPages } from "src/utils/handleTopicTagPages";
import { Bookmark } from "types";
import { getTopicTagMatch } from "src/dataLayer/getTopicTagMatch";
import { getTagList } from "src/utils/getTagList";

type TopicTagModalProps = {
	plugin: ZettelBloom;
	fileName: string;
	bookmark: Bookmark;
	onChoose?: (tags: string[]) => void;
	tags: string[];
};

export class TopicTagModal extends Modal {
	root: Root | null = null;
	plugin: ZettelBloom;
	fileName: string;
	bookmark: Bookmark;
	onChoose?: (tags: string[]) => void;
	tags;

	constructor({
		plugin,
		fileName,
		bookmark,
		onChoose,
		tags,
	}: TopicTagModalProps) {
		super(plugin.app);
		this.plugin = plugin;
		this.fileName = fileName;
		this.bookmark = bookmark;
		this.onChoose = onChoose;
		this.tags = tags;
	}

	onClose() {
		this.root?.unmount();
	}

	async onOpen() {
		// will include the tag emoji at this point
		const tagList = getTagList(this.plugin);

		const handleConfirm = async (tags: string[]) => {
			// adds a bookmark to the topic tag pages

			await handleTopicTagPages({
				settings: this.plugin.settings,
				tags: tags.map((tag) => tag.replace("🏷️ ", "")),
				fileName: this.fileName,
				app: this.plugin.app,
			});

			// remove the link from the inbox
			let inboxFile = this.plugin.app.vault.getAbstractFileByPath(
				this.plugin.settings.resourceInboxFilePath
			) as TFile;

			this.plugin.app.vault.read(inboxFile).then((currentContent) => {
				this.plugin.app.vault.modify(
					inboxFile,
					currentContent.replace(`![[${this.fileName}]]`, "")
				);
			});

			this.onChoose?.(tags);
			this.close();
		};

		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<TopicTagPicker
					tags={this.tags}
					tagList={tagList}
					bookmark={this.bookmark}
					onConfirm={handleConfirm}
				/>
			</StrictMode>
		);
	}
}
