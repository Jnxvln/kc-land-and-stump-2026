import { useEffect, useRef, useState } from "react";

const IDLE_MS = 2500;

export function ScrollToTop() {
	const [visible, setVisible] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const hovering = useRef(false);

	useEffect(() => {
		const onScroll = () => {
			const pastFirstScreen = window.scrollY > window.innerHeight;
			setVisible(pastFirstScreen);
			clearTimeout(timer.current);
			if (pastFirstScreen) {
				timer.current = setTimeout(() => {
					if (!hovering.current) setVisible(false);
				}, IDLE_MS);
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			clearTimeout(timer.current);
		};
	}, []);

	return (
		<button
			type="button"
			aria-label="Back to top"
			inert={!visible}
			onClick={() => window.scrollTo({ top: 0 })}
			onPointerEnter={() => {
				hovering.current = true;
			}}
			onPointerLeave={() => {
				hovering.current = false;
				clearTimeout(timer.current);
				timer.current = setTimeout(() => setVisible(false), IDLE_MS);
			}}
			className={`fixed right-4 bottom-24 z-30 flex size-12 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-ground/95 text-gold shadow-lg transition-opacity duration-300 hover:border-gold md:bottom-6 ${
				visible ? "opacity-100" : "pointer-events-none opacity-0"
			}`}
		>
			<svg
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M12 19V5M5 12l7-7 7 7" />
			</svg>
		</button>
	);
}
