import { PageHeader } from "@/components/docs/page-header"

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About"
        description="Learn more about the Monad design system."
      />
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          Monad is a design system built for consistency, accessibility, and developer experience.
        </p>
      </div>
    </>
  )
}
