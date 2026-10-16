import { useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { updateSiteSettings } from "#/functions/settings";
import { normalizePhone, phoneProblem } from "#/lib/phone";
import { useSiteSettings } from "#/lib/use-site-settings";

const field =
	"min-h-12 rounded-md border border-line bg-card px-3 text-base text-cream";
const iconButton =
	"flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-line-strong bg-transparent text-lg font-bold text-gold hover:border-gold disabled:cursor-default disabled:opacity-30";

type Town = { key: number; name: string };

export function BusinessInfoForm() {
	const settings = useSiteSettings();
	const router = useRouter();
	const nextKey = useRef(0);
	const makeTown = (name: string): Town => ({ key: nextKey.current++, name });

	const [phone, setPhone] = useState(settings.phone);
	const [towns, setTowns] = useState<Town[]>(() =>
		settings.serviceArea.map(makeTown),
	);
	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(
		null,
	);

	const formattedPhone = normalizePhone(phone);

	const renameTown = (key: number, name: string) =>
		setTowns((list) => list.map((t) => (t.key === key ? { ...t, name } : t)));
	const removeTown = (key: number) =>
		setTowns((list) => list.filter((t) => t.key !== key));
	const moveTown = (index: number, offset: -1 | 1) =>
		setTowns((list) => {
			const next = [...list];
			[next[index], next[index + offset]] = [next[index + offset], next[index]];
			return next;
		});

	async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!formattedPhone) {
			setStatus({
				ok: false,
				message: phoneProblem(phone) ?? "Check the phone number.",
			});
			return;
		}
		if (
			formattedPhone !== settings.phone &&
			!window.confirm(
				`Change the website's phone number to ${formattedPhone}?\n\nDouble-check it: this is how customers reach you.`,
			)
		) {
			return;
		}

		setBusy(true);
		setStatus(null);
		try {
			await updateSiteSettings({
				data: { phone, serviceArea: towns.map((t) => t.name) },
			});
			await router.invalidate();
			setPhone(formattedPhone);
			setTowns((list) => list.filter((t) => t.name.trim() !== ""));
			setStatus({ ok: true, message: "Saved. The website is updated." });
		} catch (err) {
			setStatus({ ok: false, message: (err as Error).message });
		} finally {
			setBusy(false);
		}
	}

	return (
		<form
			onSubmit={handleSave}
			className="flex flex-col gap-5 rounded-[10px] border border-line bg-surface p-4 md:p-5"
		>
			<h2 className="m-0 font-display text-xl font-extrabold font-stretch-expanded text-cream">
				Business info
			</h2>

			<label className="flex flex-col gap-2 font-semibold">
				Phone number
				<input
					type="tel"
					inputMode="tel"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					className={field}
				/>
				<span
					className={`text-[15px] font-normal ${formattedPhone ? "text-muted" : "text-tractor"}`}
				>
					{formattedPhone
						? `Shows on the site as ${formattedPhone}`
						: phoneProblem(phone)}
				</span>
			</label>

			<fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
				<legend className="mb-1 p-0 font-semibold">Towns you serve</legend>
				<p className="m-0 text-[15px] text-muted">
					The first town is your home base and is highlighted on the home page.
				</p>
				<ul className="m-0 flex list-none flex-col gap-2 p-0">
					{towns.map((town, i) => (
						<li key={town.key} className="flex gap-2">
							<input
								value={town.name}
								onChange={(e) => renameTown(town.key, e.target.value)}
								maxLength={60}
								aria-label={`Town ${i + 1}`}
								placeholder="e.g. Hooks, TX"
								className={`${field} min-w-0 flex-1`}
							/>
							<button
								type="button"
								onClick={() => moveTown(i, -1)}
								disabled={i === 0}
								aria-label={`Move ${town.name || "town"} up`}
								className={iconButton}
							>
								↑
							</button>
							<button
								type="button"
								onClick={() => moveTown(i, 1)}
								disabled={i === towns.length - 1}
								aria-label={`Move ${town.name || "town"} down`}
								className={iconButton}
							>
								↓
							</button>
							<button
								type="button"
								onClick={() => removeTown(town.key)}
								aria-label={`Remove ${town.name || "town"}`}
								className={iconButton}
							>
								✕
							</button>
						</li>
					))}
				</ul>
				<button
					type="button"
					onClick={() => setTowns((list) => [...list, makeTown("")])}
					className="min-h-12 w-fit cursor-pointer rounded-md border-[1.5px] border-dashed border-line-strong bg-transparent px-4 font-semibold text-gold hover:border-gold"
				>
					+ Add a town
				</button>
			</fieldset>

			<output
				className={`m-0 block font-semibold ${status?.ok ? "text-gold" : "text-tractor"}`}
			>
				{status?.message}
			</output>

			<button
				type="submit"
				disabled={busy || !formattedPhone}
				className="min-h-12 cursor-pointer rounded-md bg-tractor text-lg font-bold text-ground disabled:cursor-default disabled:opacity-50"
			>
				{busy ? "Saving…" : "Save business info"}
			</button>
		</form>
	);
}
