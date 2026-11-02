"use client"

import * as React from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { apiClient } from "@/lib/api"
import { useAppStore } from "@/store"
import { toast } from "@/components/ui/toast"
import { FormInput } from "@/components/ui/form-input"
import { SpinnerGapIcon, LockKeyIcon } from "@phosphor-icons/react"
import { getCustomerHomePath } from "@/lib/permissions"

export default function SetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const token = params.get("token") || ""

  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError("Missing invite token. Open the link from your email.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await apiClient.setPasswordFromInvite(token, password)
      if (!res.success || !res.user) {
        setError(res.message || "Failed to set password")
        toast.error(res.message || "Failed to set password")
        return
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("rose_auth_user", JSON.stringify(res.user))
      }
      setCurrentUser(res.user as any)
      toast.success(res.message || "Password set. Welcome!")
      const home = getCustomerHomePath((res.user as any).subscriptionStatus)
      navigate(home || "/checkout", { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-[#B5111B] flex items-center justify-center">
            <LockKeyIcon weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Set your password</h1>
            <p className="text-xs text-slate-500">Complete your Rose Associates portal invite</p>
          </div>
        </div>

        {!token && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
            This page requires a valid invite link from your email.
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}
          <FormInput
            type="password"
            label="New password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <FormInput
            type="password"
            label="Confirm password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
          />
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-2.5 rounded-xl bg-[#B5111B] hover:bg-[#990e17] disabled:bg-slate-300 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <SpinnerGapIcon className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Set password & continue"
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center">
          After signing in you will complete package checkout before creating projects.
        </p>
      </div>
    </div>
  )
}
