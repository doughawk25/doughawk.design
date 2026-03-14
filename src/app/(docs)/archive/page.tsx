import { PageHeader } from "@/components/docs/page-header"

export default function ArchivePage() {
  return (
    <>
      <PageHeader
        title="Archive"
        description="Browse archived content and past projects."
      />
      <div className="prose prose-neutral dark:prose-invert max-w-none [&_p]:mt-0">
        <p className="text-muted-foreground">
          Historical documentation and archived projects.
        </p>
      </div>
    </>
  )
}
