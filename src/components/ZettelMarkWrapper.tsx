import { useState } from "react";
import { ZettelMark } from "./ZettelMark";
import { App, MarkdownPostProcessorContext, TFile, parseYaml } from "obsidian";
import ZettelBloom from "main";
import { Bookmark } from "types";
import { removeBookmarkFromFilePath } from "src/utils/removeBookmarkFromFilePath";
import { TopicTagModal } from "./TopicTagModal";
import { sanitizeFileName } from "src/utils/sanitizeFileName";
import { getZettelMarkPropsFromContext } from "src/utils/getZettelMarkPropsFromContext";
import { getTopicTagOccurrences } from "src/utils/getTopicTagOccurrences";
import { removeExtraLineBreaks } from "src/utils/removeExtraLineBreaks";

export type ZettelMarkWrapperProps = {
	context: MarkdownPostProcessorContext;
	options: {
		fit: boolean;
	};
	plugin: ZettelBloom;
	isEmbedded?: boolean;
};

export function ZettelMarkWrapper({
	plugin,
	options,
	context,
}: ZettelMarkWrapperProps) {
	// get file and backlinks
	const file = plugin.app.vault.getAbstractFileByPath(
		context.sourcePath
	) as TFile;

	// Handling tag state locally because when triggering file system updates I'm not getting prop updates here in the react component.
	// Surely  a better way to do this. but this works for now.
	const [tags, setTags] = useState(() =>
		getTopicTagOccurrences({ file, plugin })
	);

	const bookmark: Bookmark = getZettelMarkPropsFromContext(context);

	// zod to validate the type safe boundaries of the bookmark object

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to remove this bookmark?")) {
			await removeBookmarkFromFilePath({
				plugin,
				file,
			});
		}
	};

	const handleAddTag = async () => {
		const onChoose = (newTags: string[]) => {
			setTags((tags) => [...tags, ...newTags]);
		};
		new TopicTagModal({
			plugin,
			fileName: file.basename,
			bookmark,
			onChoose,
			tags,
		}).open();
	};

	const handleRemoveTag = async (tag: string) => {
		// should this remove any backlink?
		let devTopicFileName = `🏷️ ${sanitizeFileName(tag)}`;
		const devTopicPath = `${plugin.settings.devTopicFolderPath}/${devTopicFileName}.md`;

		let devTopicFile = app.vault.getAbstractFileByPath(
			devTopicPath
		) as TFile;

		// remove the bookmark from the file
		const toReplace = `![[${file.basename}]]`;
		await plugin.app.vault.read(devTopicFile).then((currentContent) => {
			plugin.app.vault.modify(
				devTopicFile,
				currentContent.replace(toReplace, "")
			);
		});

		// clean up the line breaks after removing the bookmark
		try {
			await plugin.app.vault.read(devTopicFile).then((currentContent) => {
				plugin.app.vault.modify(
					devTopicFile,
					removeExtraLineBreaks(currentContent)
				);
			});
		} catch (error) {
			console.error("Error reading file:", error);
		}
	};

	const handleOnRemoveTag = (tag: string) => {
		handleRemoveTag?.(tag);
		setTags((tags) => tags?.filter((t) => t.replace("🏷️ ", "") !== tag));
	};

	const { fit } = options;

	return (
		<div className="flex flex-col gap-2">
			<ZettelMark {...bookmark} contain={fit ? true : false} />

			<div className="flex flex-col gap-5">
				<div className="flex flex-col gap-1">
					<div className="font-bold">Topic Tags</div>
					{tags ? (
						<div className="flex flex-wrap gap-2 border-solid border-1 border-gray-700 p-4 rounded-md">
							{tags.map((tag) => (
								<div
									key={tag}
									className="gap-1 flex py-1 px-2 items-center bg-slate-800 rounded-md"
								>
									<span>{tag}</span>

									<div
										onClick={() =>
											handleOnRemoveTag(
												tag.replace("🏷️ ", "")
											)
										}
										className="cursor-pointer hover:text-slate-100 text-slate-500 p-1"
									>
										☒
									</div>
								</div>
							))}

							<button className="h-[40px]" onClick={handleAddTag}>
								Add Tag
							</button>
						</div>
					) : null}
				</div>

				<div className="flex p-6 justify-center bg-slate-800 rounded-md">
					<div
						className=" bg-red-600 min-w-[200px] cursor-pointer text-center p-2 rounded-md hover:bg-red-700"
						onClick={handleDelete}
					>
						Delete Bookmark
					</div>
				</div>
			</div>
		</div>
	);
}
