"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface CreateStoreFormProps {
  userId: string
}

export default function CreateStoreForm({ userId }: CreateStoreFormProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Auto-generate slug from name if slug field is empty
    if (name === "name" && !formData.slug) {
      setFormData({
        ...formData,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if slug is already taken
      const { data: existingStore } = await supabase.from("stores").select("id").eq("slug", formData.slug).single()

      if (existingStore) {
        toast({
          title: "Slug already taken",
          description: "Please choose a different slug for your store.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Create the store
      const { data, error } = await supabase
        .from("stores")
        .insert({
          owner_id: userId,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        })
        .select()

      if (error) throw error

      toast({
        title: "Store created!",
        description: "Your store has been created successfully.",
      })

      // Redirect to the store dashboard
      router.push(`/dashboard/stores/${data[0].id}`)
    } catch (error: any) {
      toast({
        title: "Error creating store",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Store Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="My Awesome Store"
            required
          />
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
              placeholder="my-awesome-store"
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
            placeholder="Tell customers about your store and what you sell..."
            rows={4}
          />
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Store"}
      </Button>
    </form>
  )
}

