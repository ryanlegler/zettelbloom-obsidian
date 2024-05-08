export function getTopicTagYaml(tags: string[]) {
	const resolvedTopicTags = tags?.length
		? `topicTags: \n${tags?.reduce(
				(acc, tag, index) =>
					acc +
					(index === 0
						? `- ${tag.replace(/,/g, "")}`
						: `\n- ${tag.replace(/,/g, "")}`),
				""
		  )}`
		: "topicTags:";
	return resolvedTopicTags;
}
