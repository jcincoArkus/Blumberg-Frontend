import { Trans } from "@lingui/react/macro";

import { AdminActions, authorizationController, Can } from "~@/authorization";

export function meta() {
	return [{ title: "About" }, { name: "description", content: "About this app" }];
}

export async function clientLoader() {
	await authorizationController.load();
	return {};
}

export default function About() {
	if (authorizationController.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<h1>
			<Trans>About</Trans>
			<br />
			<Can I={AdminActions.ReadAllAdmins} a={AdminActions}>
				All admins
			</Can>
			<Can not I={AdminActions.ReadAllAdmins} a={AdminActions}>
				Not all admins
			</Can>
		</h1>
	);
}
