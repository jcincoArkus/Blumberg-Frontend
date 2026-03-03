import { Navigate, useParams } from "react-router";

/**
 * Equipment detail when navigated from a site context.
 * Redirects to the canonical equipment detail URL so one page handles both cases.
 */
export default function SiteEquipmentDetailRedirect() {
	const { equipmentId } = useParams();
	if (!equipmentId) return null;
	return <Navigate to={`/equipment/${equipmentId}`} replace />;
}
