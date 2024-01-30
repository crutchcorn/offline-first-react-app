import type { FC, PropsWithChildren } from "react";

interface RouteProtectionProps {
	conditionalComponent: FC;
}

export function RouteProtection({
	conditionalComponent: Display,
	children,
}: PropsWithChildren<RouteProtectionProps>) {
	const el = Display({});
	if (el) {
		return <>{el}</>;
	}
	return <>{children}</>;
}
