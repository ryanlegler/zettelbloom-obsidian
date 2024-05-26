import { useState } from "react";

export type ZettelMarkProps = {
	isEmbedded?: boolean;
	title: string;
	source: string;
	description?: string;
	image?: string;
	tags?: string[];
	contain?: boolean;
	onDelete?: () => void;
	handleRemoveTag?: (tag: string) => void;
	onAddTag?: () => void;
};

export function ZettelMark({
	title,
	source,
	description,
	image,
	tags: tagsInitial,
	contain,
	onDelete,
	onAddTag,
	handleRemoveTag,
	isEmbedded,
}: ZettelMarkProps) {
	const isFavicon = image?.contains(".ico"); // TODO this could check for other common icon file names like "icon-512x512" or "favicon" etc.

	// handling tag state locally because the top level function isn't reactive to changes. Might be a better way to do this. but this works for now.
	const [tags, setTags] = useState(tagsInitial);
	const handleOnRemoveTag = (tag: string) => {
		handleRemoveTag?.(tag);
		setTags((tags) => tags?.filter((t) => t.replace("🏷️ ", "") !== tag));
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="rich-link-card-container">
				<a
					className="rich-link-card"
					href={source}
					target="_blank"
					rel="noopener noreferrer"
				>
					{image && (
						<div
							className={`rich-link-image-container ${
								isFavicon ? "image-is-favicon" : ""
							}`}
						>
							<div
								className="rich-link-image"
								style={{
									backgroundImage: `url(${image})`,
									backgroundSize: contain
										? "contain"
										: "cover",
								}}
							/>
						</div>
					)}
					<div className="rich-link-card-text">
						<h1 className="rich-link-card-title">{title}</h1>
						{description && (
							<p className="rich-link-card-description">
								{description}
							</p>
						)}

						<p className="rich-link-href">{source}</p>
					</div>
				</a>
			</div>

			{isEmbedded ? (
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
										{handleRemoveTag ? (
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
										) : null}
									</div>
								))}
								{onAddTag ? (
									<button
										className="h-[40px]"
										onClick={onAddTag}
									>
										Add Tag
									</button>
								) : null}
							</div>
						) : null}
					</div>

					<div className="flex p-4 justify-center bg-slate-900">
						{onDelete ? (
							<button
								className="delete-button bg-red-600 width-auto"
								onClick={onDelete}
							>
								Delete
							</button>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}
