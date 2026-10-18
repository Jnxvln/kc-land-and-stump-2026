import { createFileRoute } from "@tanstack/react-router";
import { BusinessInfoForm } from "#/components/admin/BusinessInfoForm";

export const Route = createFileRoute("/admin/business")({
	component: () => (
		<>
			<h1 className="m-0 font-display text-3xl font-extrabold font-stretch-expanded text-cream">
				Business info
			</h1>
			<BusinessInfoForm />
		</>
	),
});
