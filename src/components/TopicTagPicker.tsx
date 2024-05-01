// import React from "react";

import { App, Modal } from "obsidian";
import { ZettelBloomSettings } from "types";
import Select from "react-select";
import { useCallback, useState } from "react";

export const TopicTagPicker = ({
	app,
	settings,
	onConfirm,
}: {
	app: App;
	settings: ZettelBloomSettings;
	onConfirm: (tags: string[]) => void;
}) => {
	const markdownFiles = app.vault.getMarkdownFiles();

	let topicTags = new Set();
	for (const file of markdownFiles) {
		if (file.path.startsWith(settings.resourceFolderPath)) {
			const cache = app.metadataCache.getFileCache(file);
			const tags = cache?.frontmatter?.topicTags; // assumes we are using the "topicTags" frontmatter for tags
			if (tags) {
				tags.forEach((tag: string) => {
					topicTags.add(tag);
				});
			}
		}
	}

	const options = Array.from(topicTags).map((tag) => {
		return {
			label: tag,
			value: tag,
		};
	}) as { label: string; value: string }[];

	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

	const handleOnChange = (
		selectedOptions: { label: string; value: string }[]
	) => {
		const strings = selectedOptions.map((option) => option.value);
		setSelectedOptions(strings);
	};
	const handleConfirm = useCallback(() => {
		onConfirm(selectedOptions);
	}, [onConfirm, selectedOptions]);

	return (
		<div className="flex flex-col gap-2 mt-3">
			<h1 className="font-bold">Choose Topic Tags</h1>
			<Select
				isMulti
				isSearchable
				placeholder="Choose one or more Topic Tags"
				options={options}
				onChange={handleOnChange}
				className="my-react-select-container"
				classNamePrefix="my-react-select"
			/>
			<div className="flex justify-end">
				<button className="p-1 bg-black" onClick={handleConfirm}>
					Create
				</button>
			</div>
		</div>
	);
};
