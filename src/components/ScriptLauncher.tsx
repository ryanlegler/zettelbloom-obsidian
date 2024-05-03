export const ScriptLauncher = ({
	onConfirm,
	options,
}: {
	onConfirm: (payload: string) => void;
	options: { label: string; value: string }[];
}) => {
	return (
		<div className="flex flex-col gap-2 mt-3">
			<h2 className="font-bold">Choose Script to Run</h2>
			{options.map((option) => (
				<button
					key={option.value}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					onClick={() => onConfirm(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};
