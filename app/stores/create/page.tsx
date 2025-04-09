import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import CreateStoreForm from "./create-store-form"

export default async function CreateStorePage() {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth?redirect=/stores/create")
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Your Store</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Set up your online store and start selling your products
        </p>
      </div>
      <CreateStoreForm userId={session.user.id} />
    </div>
  )
}

