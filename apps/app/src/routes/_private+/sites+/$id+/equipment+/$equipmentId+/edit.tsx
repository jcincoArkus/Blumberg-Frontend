import { Navigate, useParams } from "react-router";

/**
 * Equipment edit when navigated from a site context.
 * Redirects to the canonical equipment edit URL.
 */
export default function SiteEquipmentEditRedirect() {
	const { equipmentId } = useParams();
	if (!equipmentId) return null;
	return <Navigate to={`/equipment/${equipmentId}/edit`} replace />;
}
