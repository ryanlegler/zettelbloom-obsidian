// import React from "react";

import { App } from "obsidian";
import { ZettelBloomSettings } from "types";
import Select from "react-select";
import { useCallback, useState } from "react";

export const TopicTagPicker = ({
	onConfirm,
	suggested,
	tagList,
}: {
	app: App;
	settings: ZettelBloomSettings;
	onConfirm: (tags: string[]) => void;
	suggested: string[];
	tagList: string[];
}) => {
	const options = Array.from(tagList).map((tag) => {
		return {
			label: tag,
			value: tag,
		};
	}) as { label: string; value: string }[];

	const [selectedOptions, setSelectedOptions] = useState<string[]>(suggested);

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
				value={selectedOptions.map((option) => {
					return {
						label: option,
						value: option,
					};
				})}
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
