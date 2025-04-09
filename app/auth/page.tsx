import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import AuthForm from "./auth-form"

export default async function AuthPage() {
  const supabase = createServerClient()

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center py-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground">Enter your email to sign in or create an account</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}

