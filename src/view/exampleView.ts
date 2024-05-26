import { ItemView, WorkspaceLeaf } from "obsidian";
import { ZettelBloomSettings } from "types";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
	public settings: ZettelBloomSettings;

	constructor(leaf: WorkspaceLeaf, settings: ZettelBloomSettings) {
		super(leaf);
		this.settings = settings;
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Example view" });

		const { resourceUrlCache } = this.settings;

		// give me a filter list of the resourceUrlCache that have a date of today
		const todayAsString = new Date().toISOString().split("T")[0]; // const todayAsString = new Date().toISOString().split("T")[0];

		const todaysResources = Object.entries(resourceUrlCache).filter(
			([key, value]) => {
				// console.log("🚀 ~ ExampleView ~ onOpen ~ value:", value);
				// console.log("🚀 ~ ExampleView ~ onOpen ~ key:", key);
				const date = resourceUrlCache?.[key];
				const dateString = new Date(date).toISOString().split("T")[0];
				return dateString === todayAsString;
			}
		);

		// output the resourceUrlCache
		container.createEl("pre", {
			text: JSON.stringify(todaysResources, null, 2),
		});
	}

	async onClose() {
		// Nothing to clean up.
	}
}
