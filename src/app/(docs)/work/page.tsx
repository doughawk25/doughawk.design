import { PageHeader } from "@/components/docs/page-header"

export default function WorkPage() {
  return (
    <>
      <PageHeader
        title="Work"
        description="Explore our work and projects."
      />
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          Selected projects and case studies from the Monad design system in action.
        </p>
      </div>
    </>
  )
}
