import { DEFAULT_SETTINGS } from "./src/constants";
import {
	Notice,
	Plugin,
	// WorkspaceLeaf,
	parseYaml,
} from "obsidian";
import { ZettelBloomSettings } from "types";
import { externalSync } from "src/utils/externalSync";
import { ScriptModal } from "src/components/ScriptModal";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ZettelMark } from "src/components/ZettelMark";
import { inPlaceCommand } from "src/commands/inPlaceCommand";

import "styles.css";

import SettingTab from "./src/SettingTab";
import { ZettelMarkWrapper } from "src/components/ZettelMarkWrapper";
import { getZettelMarkPropsFromContext } from "src/utils/getZettelMarkPropsFromContext";
import { ZettelMarkLoading } from "src/components/ZettelMarkLoading";
export default class ZettelBloom extends Plugin {
	settings: ZettelBloomSettings;
	private timeoutIDAutoSync?: number;

	async onload() {
		await this.loadSettings();

		if (this.settings.raindropSync) {
			// This creates an icon in the left ribbon.
			const ribbonIconEl = this.addRibbonIcon(
				"cloud",
				"Raindrop Sync",
				(evt: MouseEvent) => {
					// Called when the user clicks the icon.
					externalSync(this);
				}
			);
			// Perform additional things with the ribbon
			ribbonIconEl.addClass("raindrop-sync-ribbon-class");
		}

		this.addCommand({
			id: "in-place-bookmark",
			name: "ZettelBloom In-Place Bookmark",
			callback: async () => {
				inPlaceCommand({
					plugin: this,
				});
			},
			hotkeys: [
				{
					modifiers: ["Meta", "Shift"],
					key: "L",
				},
			],
		});

		this.addCommand({
			id: "command-palette-modal",
			name: "Command Palette Modal",
			callback: () => {
				new ScriptModal(this).open();
			},
			hotkeys: [
				{
					modifiers: ["Meta", "Shift"],
					key: "R",
				},
			],
		});

		this.registerMarkdownCodeBlockProcessor(
			"zettelMark",
			(_source, el, context) => {
				const root: Root = createRoot(el);

				const isEmbedded =
					el.parentElement?.classList?.contains("cm-embed-block");

				const props = getZettelMarkPropsFromContext(context);
				const options = parseYaml(_source) || {};
				const { fit } = options;

				root.render(
					<StrictMode>
						{!isEmbedded ? (
							<ZettelMark
								{...props}
								contain={fit ? true : false}
							/>
						) : (
							<ZettelMarkWrapper
								plugin={this}
								options={options}
								context={context}
							/>
						)}
					</StrictMode>
				);
			}
		);
		this.registerMarkdownCodeBlockProcessor(
			"zettelMarkLoading",
			(_source, el, context) => {
				const root: Root = createRoot(el);

				const isEmbedded =
					el.parentElement?.classList?.contains("cm-embed-block");

				root.render(
					<StrictMode>
						<ZettelMarkLoading />
					</StrictMode>
				);
			}
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);

		if (
			this.settings.raindropSync &&
			(!this.settings.resourceFolderPath ||
				!this.settings.raindropToken ||
				!this.settings.raindropCollectionID)
		) {
			new Notice(`MISSING CONFIG`);
			return;
		}

		this.app.workspace.onLayoutReady(async () => {
			let folderPath = this.settings.resourceFolderPath;
			let folder = await this.app.vault.getAbstractFileByPath(folderPath);

			if (!folder) {
				new Notice(`Invalid Folder Path`);
				return;
			}
			if (
				this.settings.autoSyncInterval &&
				this.settings.raindropSync &&
				this.settings.raindropAutoSync
			) {
				new Notice(`startAutoSync`);
				await this.startAutoSync();
			}
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async clearAutoSync(): Promise<void> {
		if (this.timeoutIDAutoSync) {
			window.clearTimeout(this.timeoutIDAutoSync);
			this.timeoutIDAutoSync = undefined;
		}
		console.info("Clearing auto sync...");
	}
	async startAutoSync(): Promise<void> {
		const minutesToSync = parseInt(this.settings.autoSyncInterval, 10);

		if (minutesToSync > 0) {
			this.timeoutIDAutoSync = window.setTimeout(() => {
				new Notice(`✅ SYNCING...`);
				externalSync(this);
				this.startAutoSync();
			}, minutesToSync * 60000);
		}
	}
}

// add this as a method on the class
// async activateView() {
// 	const { workspace } = this.app;

// 	let leaf: WorkspaceLeaf | null = null;
// 	const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

// 	if (leaves.length > 0) {
// 		// A leaf with our view already exists, use that
// 		leaf = leaves[0];
// 	} else {
// 		// Our view could not be found in the workspace, create a new leaf
// 		// in the right sidebar for it
// 		leaf = workspace.getRightLeaf(false);
// 		await leaf?.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
// 	}

// 	// "Reveal" the leaf in case it is in a collapsed sidebar
// 	if (leaf) {
// 		workspace.revealLeaf(leaf);
// 	}
// }

// call it on the onload method

// this.addRibbonIcon("dice", "Activate view", () => {
// 	this.activateView();
// });
