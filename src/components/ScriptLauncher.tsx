export const ScriptLauncher = ({
	onConfirm,
	options,
}: {
	onConfirm: (payload: string) => void;
	options: { label: string; value: string }[];
}) => {
	return (
		<div className="flex flex-col gap-2 mt-3">
			<h4 className="font-bold">Choose Script to Run</h4>

			<div className="flex flex-col gap-2">
				{options.map((option) => (
					<div
						key={option.value}
						className=" text-white py-2 px-4 rounded text-left bg-slate-900 hover:bg-slate-700 cursor-pointer"
						onClick={() => onConfirm(option.value)}
					>
						{option.label}
					</div>
				))}
			</div>
		</div>
	);
};
