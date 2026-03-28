"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

const STORAGE_KEY = "monad-system-auth"
const PASSWORD =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SYSTEM_PASSWORD ?? "4255"
    : "4255"

function getStoredAuth(): boolean {
  if (typeof window === "undefined") return false
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function setStoredAuth() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1")
  } catch {
    // ignore
  }
}

const LOCKED_PATHS = ["/about", "/contact", "/work", "/archive"]

const SystemAuthContext = React.createContext<{
  isAuthenticated: boolean
  setAuthenticated: () => void
  openModalForRedirect: (href: string) => void
} | null>(null)

export function useSystemAuth() {
  const ctx = React.useContext(SystemAuthContext)
  return ctx
}

export function SystemAuthProvider({
  children,
  pathname,
}: {
  children: React.ReactNode
  pathname: string
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [pendingRedirect, setPendingRedirect] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsAuthenticated(getStoredAuth())
    setIsHydrated(true)
  }, [])

  const setAuthenticated = React.useCallback(() => {
    setStoredAuth()
    setIsAuthenticated(true)
  }, [])

  const openModalForRedirect = React.useCallback((href: string) => {
    setPendingRedirect(href)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password === PASSWORD) {
      setAuthenticated()
      setPassword("")
      if (pendingRedirect) {
        router.push(pendingRedirect)
        setPendingRedirect(null)
      }
    } else {
      setError("Incorrect PIN")
    }
  }

  const handleCancel = () => {
    setPendingRedirect(null)
    router.push("/")
  }

  const requiresAuthForPath = LOCKED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  const showModal =
    isHydrated &&
    !isAuthenticated &&
    (requiresAuthForPath || pendingRedirect != null)

  return (
    <SystemAuthContext.Provider value={{ isAuthenticated, setAuthenticated, openModalForRedirect }}>
      {children}
      <Dialog
        open={showModal}
        onOpenChange={(open, eventDetails) => {
          if (eventDetails?.reason === "outside-press" || eventDetails?.reason === "escape-key") {
            eventDetails?.cancel?.()
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>You shall not pass, robots still working.</DialogTitle>
              <DialogDescription>
                Unless you know the secret code.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>PIN</Label>
                <InputOTP
                  maxLength={4}
                  value={password}
                  onChange={(value) => setPassword(value.replace(/\D/g, ""))}
                  aria-invalid={!!error}
                  autoFocus
                >
                  <InputOTPGroup className="aria-invalid:border-destructive aria-invalid:ring-destructive/20">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>
            <DialogFooter showCloseButton={false}>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SystemAuthContext.Provider>
  )
}
