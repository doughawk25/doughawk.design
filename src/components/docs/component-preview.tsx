"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon, Image, Square } from "lucide-react"

export function ComponentPreview({
  name,
  description,
  code,
  children,
  fitContent,
  showBgToggle = true,
}: {
  name: string
  description: string
  code: string
  children: React.ReactNode
  /** When true, container grows to fit content instead of fixed 16:9 ratio */
  fitContent?: boolean
  /** When false, hides the background image toggle. Default true. */
  showBgToggle?: boolean
}) {
  const pathname = usePathname()
  const { copied, copy } = useCopyToClipboard()
  const [activeTab, setActiveTab] = useState("preview")
  const [showBgImage, setShowBgImage] = useState(false)

  const isComponentPage = pathname.startsWith("/components/")
  const showTitle = !isComponentPage

  const previewBgClass = showBgImage
    ? "bg-cover bg-center"
    : "bg-muted/50"
  const previewBgStyle = showBgImage
    ? { backgroundImage: "url(/example-bg.png)" }
    : undefined

  return (
    <div className="mb-8">
      {showTitle && (
        <>
          <h3 className="text-lg font-semibold mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        </>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          {activeTab === "preview" && showBgToggle && (
            <Tabs
              value={showBgImage ? "image" : "plain"}
              onValueChange={(v) => setShowBgImage(v === "image")}
            >
              <TabsList>
                <TabsTrigger value="plain" aria-label="Plain background">
                  <Square className="size-4" />
                </TabsTrigger>
                <TabsTrigger value="image" aria-label="Image background">
                  <Image className="size-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        <TabsContent value="preview">
          {fitContent ? (
            <div
              className={`overflow-auto rounded-[var(--radius-surface)] ${previewBgClass}`}
              style={previewBgStyle}
            >
              <div className="flex min-w-0 items-center justify-center px-8 py-6">
                {children}
              </div>
            </div>
          ) : (
            <AspectRatio
              ratio={16 / 9}
              className="overflow-auto rounded-[var(--radius-surface)]"
            >
              <div
                className={`flex size-full min-h-0 min-w-0 items-center justify-center overflow-auto px-8 py-6 ${previewBgClass}`}
                style={previewBgStyle}
              >
                {children}
              </div>
            </AspectRatio>
          )}
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
