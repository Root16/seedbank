const DEFAULT_LOG_DEBUG = true;

export type Entity = ComponentFramework.WebApi.Entity;

export const logDebug = (...message: any) => {
	//@ts-ignore
	const { LOG_DEBUG } = window.env === undefined ? { LOG_DEBUG: DEFAULT_LOG_DEBUG } : window.env;
	if (LOG_DEBUG) {
		console.log("DEBUG: ", message);
	}
};
