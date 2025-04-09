"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

interface StoreSettingsProps {
  store: any
}

export default function StoreSettings({ store }: StoreSettingsProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isConnectingStripe, setIsConnectingStripe] = useState(false)
  const [formData, setFormData] = useState({
    name: store.name,
    slug: store.slug,
    description: store.description || "",
    theme_color: store.theme_color,
    active: store.active,
    commission_rate: store.commission_rate,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      active: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if slug is already taken (if changed)
      if (formData.slug !== store.slug) {
        const { data: existingStore } = await supabase
          .from("stores")
          .select("id")
          .eq("slug", formData.slug)
          .neq("id", store.id)
          .single()

        if (existingStore) {
          toast({
            title: "Slug already taken",
            description: "Please choose a different slug for your store.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      // Update the store
      const { error } = await supabase
        .from("stores")
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          theme_color: formData.theme_color,
          active: formData.active,
          commission_rate: Number.parseFloat(formData.commission_rate as any),
          updated_at: new Date().toISOString(),
        })
        .eq("id", store.id)

      if (error) throw error

      toast({
        title: "Store updated",
        description: "Your store settings have been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error updating store",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStore = async () => {
    if (!window.confirm("Are you sure you want to delete this store? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("stores").delete().eq("id", store.id)

      if (error) throw error

      toast({
        title: "Store deleted",
        description: "Your store has been deleted successfully.",
      })

      router.push("/dashboard/stores")
    } catch (error: any) {
      toast({
        title: "Error deleting store",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const connectStripe = async () => {
    setIsConnectingStripe(true)

    try {
      // Get the current user's email
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to connect Stripe")
      }

      // Call the API to create a Stripe account and get the onboarding URL
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: store.id,
          email: user.email,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to connect Stripe")
      }

      const { url } = await response.json()

      // Redirect to Stripe onboarding
      window.location.href = url
    } catch (error: any) {
      toast({
        title: "Error connecting Stripe",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsConnectingStripe(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>Update your store information and settings</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Store Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">
                Store URL
                <span className="ml-1 text-sm text-slate-500">(this will be used in your store URL)</span>
              </Label>
              <div className="flex items-center">
                <span className="mr-2 text-slate-500">marketHub.com/stores/</span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens are allowed"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="theme_color">Theme Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="theme_color"
                  name="theme_color"
                  type="color"
                  value={formData.theme_color}
                  onChange={handleChange}
                  className="h-10 w-20"
                />
                <Input name="theme_color" value={formData.theme_color} onChange={handleChange} className="flex-1" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the percentage that the platform will take from each sale. The default is 5%.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="active">Store Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDeleteStore}>
              Delete Store
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
          <CardDescription>Connect your store to Stripe to receive payments</CardDescription>
        </CardHeader>
        <CardContent>
          {store.stripe_account_id ? (
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Your store is connected to Stripe</p>
                <p className="text-sm">Account ID: {store.stripe_account_id}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Your store is not connected to Stripe</p>
                <p className="text-sm">Connect your store to Stripe to receive payments from customers.</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant={store.stripe_account_id ? "outline" : "default"}
            onClick={connectStripe}
            disabled={isConnectingStripe}
          >
            {isConnectingStripe
              ? "Connecting..."
              : store.stripe_account_id
                ? "Update Stripe Account"
                : "Connect with Stripe"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

