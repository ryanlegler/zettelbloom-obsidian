import { App, PluginSettingTab, Setting } from "obsidian";

import ZettelBloom from "main";

export default class SettingTab extends PluginSettingTab {
	plugin: ZettelBloom;

	constructor(app: App, plugin: ZettelBloom) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("ZettelMark Folder Path")
			.setDesc("Where the new file per ZettelMark should be located")
			.addText((text) =>
				text
					.setPlaceholder("Folder Path")
					.setValue(this.plugin.settings.resourceFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.resourceFolderPath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Resource Inbox File Path")
			.setDesc(
				"The File new resources should be added to. Include the file extension"
			)
			.addText((text) =>
				text
					.setPlaceholder("Resource Inbox File Path")
					.setValue(this.plugin.settings.resourceInboxFilePath)
					.onChange(async (value) => {
						this.plugin.settings.resourceInboxFilePath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Dev Topic Folder Path")
			.setDesc("The Folder Dev Topic Files should be located")
			.addText((text) =>
				text
					.setPlaceholder("Dev Topic Folder Path")
					.setValue(this.plugin.settings.devTopicFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.devTopicFolderPath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Dev Topic 'Uplink' Path")
			.setDesc(
				"Each Dev Topic File should have a link back to this file."
			)
			.addText((text) =>
				text
					.setPlaceholder("Dev Topic 'Uplink' Path")
					.setValue(this.plugin.settings.devTopicUpLinkPath)
					.onChange(async (value) => {
						this.plugin.settings.devTopicUpLinkPath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Bookmark Emoji Prefix")
			.setDesc(
				"The Emoji that will be used to prefix the new note for a bookmark"
			)
			.addText((text) =>
				text
					.setPlaceholder("Emoji Prefix")
					.setValue(this.plugin.settings.resourceEmojiPrefix)
					.onChange(async (value) => {
						this.plugin.settings.resourceEmojiPrefix = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Integration")
			.setDesc(
				"Sync Raindrop.io data to Obsidian. This will create a new note for each bookmark in the specified folder."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.raindropSync)
					.onChange(async (value) => {
						this.plugin.settings.raindropSync = value;
						await this.plugin.saveSettings();
						// reset the plugins settings
						this.display();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Integration Token")
			.setDesc(
				"Using Raindrop.io, create an Integration, copy the token and paste it here."
			)
			.setDisabled(!this.plugin.settings.raindropSync)
			.addText((text) =>
				text
					.setDisabled(!this.plugin.settings.raindropSync)
					.setPlaceholder("Add API Key here")
					.setValue(this.plugin.settings.raindropToken)
					.onChange(async (value) => {
						this.plugin.settings.raindropToken = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Collection")
			.setDesc(
				"Currently this plugin only supports one collection as a time. Add the Collection ID here."
			)
			.setDisabled(!this.plugin.settings.raindropSync)
			.addText((text) =>
				text
					.setDisabled(!this.plugin.settings.raindropSync)
					.setPlaceholder("Raindrop Collection ID")
					.setValue(this.plugin.settings.raindropCollectionID)
					.onChange(async (value) => {
						this.plugin.settings.raindropCollectionID = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Raindrop Back Sync Enabled")
			.setDesc(
				"When the Manual (In Place) Link Expansion, this will also sync the bookmark up to Raindrop.io"
			)
			.setDisabled(!this.plugin.settings.raindropSync)
			.addToggle((toggle) =>
				toggle
					.setDisabled(!this.plugin.settings.raindropSync)
					.setValue(this.plugin.settings.raindropBackSync)
					.onChange(async (value) => {
						this.plugin.settings.raindropBackSync = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Auto Sync Enabled")
			.setDisabled(!this.plugin.settings.raindropSync)
			.addToggle((toggle) =>
				toggle
					.setDisabled(!this.plugin.settings.raindropSync)
					.setValue(this.plugin.settings.raindropAutoSync)
					.onChange(async (value) => {
						this.plugin.settings.raindropAutoSync = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Raindrop Sync Interval")
			.setDesc("Interval in minutes to sync Raindrop.io data")
			.setDisabled(!this.plugin.settings.raindropSync)
			.addText((text) =>
				text
					.setDisabled(!this.plugin.settings.raindropSync)
					.setPlaceholder("Sync Interval")
					.setValue(this.plugin.settings.autoSyncInterval)
					.onChange(async (value) => {
						this.plugin.settings.autoSyncInterval = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
