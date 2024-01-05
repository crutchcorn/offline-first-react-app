import type { JSXElementConstructor, PropsWithChildren } from "react";

interface RouteProtectionProps {
	conditionalComponent: JSXElementConstructor<Record<string, never>>,
}

export function RouteProtection({conditionalComponent: Display, children}: PropsWithChildren<RouteProtectionProps>) {
	const el = <Display/>
	if (el) {
		return <>{el}</>
	}
	return <>{children}</>;
}
