import styles from "./dialog.module.css";
import type { PropsWithChildren } from "react";

export const Dialog = ({ children }: PropsWithChildren) => {
	return (
		<div className={styles.dialogContainer}>
			<div className={styles.scrim} />
			<div className={styles.dialog}>{children}</div>
		</div>
	);
};
