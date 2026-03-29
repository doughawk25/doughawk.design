"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { FormBuilder } from "@/components/tools/form-builder"

export default function ToolsPage() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const prev = theme
    setTheme("light")
    return () => {
      if (prev) setTheme(prev)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <FormBuilder />
}
