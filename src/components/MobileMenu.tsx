import { Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { navItems } from "#/lib/nav";
import { useSiteSettings } from "#/lib/use-site-settings";
import { PhoneIcon } from "./PhoneIcon";

export function MobileMenu() {
	const [open, setOpen] = useState(false);
	const { phone, phoneHref } = useSiteSettings();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const panelId = useId();

	useEffect(() => {
		if (!open) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
				buttonRef.current?.focus();
			}
		};
		const onPointerDown = (e: PointerEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		};

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [open]);

	const close = () => setOpen(false);

	return (
		<div ref={containerRef} className="lg:hidden">
			<button
				ref={buttonRef}
				type="button"
				aria-expanded={open}
				aria-controls={panelId}
				aria-label={open ? "Close menu" : "Open menu"}
				onClick={() => setOpen((v) => !v)}
				className="flex size-11 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-line-strong bg-transparent text-gold hover:border-gold"
			>
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.2"
					strokeLinecap="round"
					aria-hidden="true"
				>
					{open ? (
						<path d="M6 6l12 12M18 6L6 18" />
					) : (
						<path d="M4 7h16M4 12h16M4 17h16" />
					)}
				</svg>
			</button>

			<div
				id={panelId}
				hidden={!open}
				className="absolute inset-x-0 top-full z-20 border-b border-line bg-ground px-5 pt-2 pb-6 shadow-lg md:px-16"
			>
				<nav aria-label="Mobile">
					<ul className="m-0 flex list-none flex-col p-0">
						{navItems.map((item) => (
							<li key={item.label} className="border-b border-line">
								<Link
									to={item.to}
									hash={"hash" in item ? item.hash : undefined}
									onClick={close}
									className="flex min-h-14 items-center text-xl font-semibold text-gold no-underline hover:text-white"
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<a
					href={phoneHref}
					className="mt-5 flex min-h-12 items-center justify-center gap-2.5 rounded-md bg-tractor p-3.5 text-lg font-bold text-ground no-underline"
				>
					<PhoneIcon size={20} />
					Call {phone}
				</a>
			</div>
		</div>
	);
}
