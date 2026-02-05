import { t } from "~@/i18n/macro";

interface MobileOverlayProps {
	open: boolean;
	onClose: () => void;
}

export function MobileOverlay({ open, onClose }: MobileOverlayProps) {
	if (!open) return null;
	return (
		<div
			className="fixed inset-0 z-40 bg-black/50 lg:hidden"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="button"
			tabIndex={0}
			aria-label={t`Close menu`}
		/>
	);
}
