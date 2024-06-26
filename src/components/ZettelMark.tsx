export type ZettelMarkProps = {
	title: string;
	source: string;
	description?: string;
	image?: string;
	contain?: boolean;
};

export function ZettelMark({
	title,
	source,
	description,
	image,
	contain,
}: ZettelMarkProps) {
	const isFavicon = contain || image?.contains(".ico"); // TODO this could check for other common icon file names like "icon-512x512" or "favicon" etc.

	return (
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
								backgroundSize: contain ? "contain" : "cover",
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
	);
}
