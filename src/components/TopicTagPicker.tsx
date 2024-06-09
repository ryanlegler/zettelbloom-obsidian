// import React from "react";

import Select from "react-select";
import { useCallback, useEffect, useState } from "react";
import { getTopicTagMatch } from "src/dataLayer/getTopicTagMatch";
import { Bookmark } from "types";

export const TopicTagPicker = ({
	onConfirm,
	tagList,
	bookmark,
	tags,
}: {
	onConfirm?: (tags: string[]) => void;
	tagList: string[];
	bookmark: Bookmark;
	tags: string[];
}) => {
	const [suggested, setSuggested] = useState<string[] | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchSuggested = async () => {
			const suggested: string[] = await getTopicTagMatch(
				bookmark,
				tagList
			);
			const withEmoji = suggested.map((tag) => `🏷️ ${tag}`);

			const filterSuggestions = withEmoji.filter((suggestedTag) => {
				return !tags.includes(suggestedTag);
			});
			setSuggested(filterSuggestions);
			setIsLoading(false);
		};
		fetchSuggested();
	}, [tagList]);

	// const suggested = await getTopicTagMatch(this.bookmark, tagList);
	const options = Array.from(tagList).map((tag) => {
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
		onConfirm?.(selectedOptions);
	}, [onConfirm, selectedOptions]);

	return (
		<div className="flex flex-col gap-4 mt-2">
			<div className="flex flex-col gap-2">
				<div className="font-bold size text-2xl">Choose Topics</div>
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
			</div>
			<div className="flex flex-col gap-2">
				<div className="font-bold text-base">Suggested Topics</div>

				<div className="flex flex-wrap gap-2">
					{isLoading && <div>Loading...</div>}

					{suggested?.map((tag) => {
						return (
							<button
								key={tag}
								onClick={() => {
									setSelectedOptions([
										...selectedOptions,
										tag,
									]);
								}}
								className="p-1 bg-gray-100"
							>
								{tag}
							</button>
						);
					})}
				</div>
			</div>
			<div className="flex justify-end">
				<button className="p-1 bg-black" onClick={handleConfirm}>
					Add Topic Pages
				</button>
			</div>
		</div>
	);
};
