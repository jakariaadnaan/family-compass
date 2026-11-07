import { createFileRoute } from "@tanstack/react-router";
import { DesignPreview, previewPages, type PreviewPage } from "@/components/DesignPreview";
import { pageMeta } from "@/lib/dashboard";
export const Route = createFileRoute("/_authenticated/design-preview")({
 head: () => pageMeta("Device design preview", "Explore Haven's device dashboard design with illustrative data and inactive page previews."),
 validateSearch: (search: Record<string, unknown>): { page: PreviewPage } => ({ page: previewPages.find(item => item.id === search["page"])?.id ?? "dashboard" }),
 component: PreviewRoute,
});
function PreviewRoute() {
 const { page } = Route.useSearch();
 return <DesignPreview page={page} />;
}
