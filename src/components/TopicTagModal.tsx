import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";

import ZettelBloom from "main";
import { TopicTagPicker } from "./TopicTagPicker";
import { handleTopicTagPages } from "src/utils/handleTopicTagPages";
import { MetaData } from "types";

export class TopicTagModal extends Modal {
	root: Root | null = null;
	plugin: ZettelBloom;
	newFileName: string;
	metadata: MetaData["metadata"];

	constructor(
		plugin: ZettelBloom,
		newFileName: string,
		metadata: MetaData["metadata"]
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.newFileName = newFileName;
		this.metadata = metadata;
	}

	onClose() {
		this.root?.unmount();
	}

	async onOpen() {
		const markdownFiles = this.plugin.app.vault.getMarkdownFiles();

		const tagList = markdownFiles
			.filter((file) => {
				return file.path.startsWith(
					this.plugin.settings.devTopicFolderPath
				);
			})
			.map((file) => {
				return file.basename;
			});
		console.log("🚀 ~ TopicTagModal ~ onOpen ~ tagList:", tagList);

		const handleConfirm = async (tags: string[]) => {
			await handleTopicTagPages({
				settings: this.plugin.settings,
				tags: tags.map((tag) => tag.replace("🏷️ ", "")),
				newFileName: this.newFileName,
				app: this.plugin.app,
			});
			this.close();
		};

		const response = await fetch(
			`https://zettelbloom-api.vercel.app/api/getTopicTagMatch`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					metadata: this.metadata,
					tagList: tagList.map((tag) => tag.replace("🏷️ ", "")),
				}),
			}
		);

		const suggested = await response.json();
		console.log("🚀 ~ TopicTagModal ~ onOpen ~ suggested:", suggested);

		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<TopicTagPicker
					tagList={tagList}
					suggested={suggested}
					onConfirm={handleConfirm}
				/>
			</StrictMode>
		);
	}
}
