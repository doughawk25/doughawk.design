import { PageHeader } from "@/components/docs/page-header"
import { navigation } from "@/lib/tokens"
import Link from "next/link"

export default function SystemOverviewPage() {
  return (
    <>
      <PageHeader
        title="Design System"
        description="Foundations, tokens, components, and motion. Everything that makes Monad consistent."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {navigation.map((section) => (
          <Link
            key={section.title}
            href={section.items[0].href}
            className="rounded-lg border border-border p-6 transition-colors hover:bg-muted/50"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {section.items.length} {section.items.length === 1 ? "page" : "pages"}
            </p>
          </Link>
        ))}
      </div>
    </>
  )
}
