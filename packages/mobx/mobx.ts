import { makeAutoObservable as _internalMakeAutoObservable } from "mobx";

export const makeAutoObservable: typeof _internalMakeAutoObservable = (
	target,
	overrides,
	options,
) => {
	return _internalMakeAutoObservable(target, overrides, {
		autoBind: true,
		...options,
	});
};

export {
	action,
	autorun,
	computed,
	makeObservable,
	observable,
	reaction,
	runInAction,
	when,
} from "mobx";
export { observer } from "mobx-react-lite";
