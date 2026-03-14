"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Switch } from "@/components/ui/switch"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon } from "lucide-react"

const PREVIEW_BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"

export function ComponentPreview({
  name,
  description,
  code,
  children,
}: {
  name: string
  description: string
  code: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { copied, copy } = useCopyToClipboard()
  const [activeTab, setActiveTab] = useState("preview")
  const [imageBehind, setImageBehind] = useState(false)

  const isComponentPage = pathname.startsWith("/components/")
  const showTitle = !isComponentPage

  return (
    <div className="mb-8">
      {showTitle && (
        <>
          <h3 className="text-lg font-semibold mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        </>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <Switch
            id={`${name}-image-behind`}
            checked={imageBehind}
            onCheckedChange={setImageBehind}
            aria-label="Image behind"
          />
        </div>
        <TabsContent value="preview">
          <AspectRatio
            ratio={16 / 9}
            className="overflow-hidden rounded-[var(--radius-surface)]"
          >
            {imageBehind ? (
              <>
                <img
                  src={PREVIEW_BACKGROUND_IMAGE}
                  alt="Photo"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {children}
                </div>
              </>
            ) : (
              <div className="flex size-full items-center justify-center bg-muted/50 p-8">
                {children}
              </div>
            )}
          </AspectRatio>
        </TabsContent>
        <TabsContent value="code">
          <div className="relative">
            <button
              onClick={() => copy(code)}
              className="absolute top-3 right-3 p-2 rounded-md hover:bg-muted transition-colors"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-600" />
              ) : (
                <CopyIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <pre className="rounded-lg border border-border bg-muted/50 p-4 overflow-x-auto">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
