export function ZettelMarkLoading({}) {
	const image =
		"https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjJxcm1oNGppNnJrbm0zd2NjMHRmenU0YWk2d3FhdGFnODQ5MG1wOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9QBq5iaV6kB5m/giphy.webp";
	const title = "....fetching title";
	const source = "";
	const description = "...fetching description";
	const contain = true;

	const isFavicon = image?.contains(".ico"); // TODO this could check for other common icon file names like "icon-512x512" or "favicon" etc.

	return (
		<div className="rich-link-card-container">
			<div className="rich-link-card">
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
			</div>
		</div>
	);
}
