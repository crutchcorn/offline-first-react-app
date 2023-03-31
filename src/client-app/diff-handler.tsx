import { useAppSelector } from "../store/store";
import { createPortal } from "react-dom";

export const DiffHandler = () => {
	const updatesToDiff = useAppSelector((state) => state.diff.updatesToDiff);

	if (!updatesToDiff || updatesToDiff.length === 0) {
		return null;
	}

	return createPortal(
		<div>
			{updatesToDiff.map((person) => (
				<p key={person.id}>{person.name}</p>
			))}
		</div>,
		document.querySelector("#portal-injection")!
	);
};
