import type { SubmitButtonProps } from "~@/forms";

import { Button } from "../Button";

export function AppSubmitButton({ isSubmitting, isDisabled, label }: SubmitButtonProps) {
	return (
		<Button type="submit" disabled={isSubmitting || isDisabled}>
			{isSubmitting ? "Saving…" : (label ?? "Submit")}
		</Button>
	);
}
