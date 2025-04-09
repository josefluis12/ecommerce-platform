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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

interface ProductFormProps {
  storeId: string
  categories: any[]
  initialData: any | null
}

export default function ProductForm({ storeId, categories, initialData }: ProductFormProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    compare_at_price: initialData?.compare_at_price || "",
    cost_price: initialData?.cost_price || "",
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    inventory_quantity: initialData?.inventory_quantity || 0,
    weight: initialData?.weight || "",
    weight_unit: initialData?.weight_unit || "kg",
    active: initialData?.active ?? true,
    featured: initialData?.featured ?? false,
    categoryIds: initialData?.categoryIds || [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value === "" ? "" : Number.parseFloat(value),
    })
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        categoryIds: [...formData.categoryIds, categoryId],
      })
    } else {
      setFormData({
        ...formData,
        categoryIds: formData.categoryIds.filter((id: string) => id !== categoryId),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if slug is already taken (if new product or slug changed)
      if (!initialData || formData.slug !== initialData.slug) {
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("slug", formData.slug)
          .eq("store_id", storeId)
          .maybeSingle()

        if (existingProduct) {
          toast({
            title: "Slug already taken",
            description: "Please choose a different slug for your product.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const productData = {
        store_id: storeId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        compare_at_price: formData.compare_at_price || null,
        cost_price: formData.cost_price || null,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        inventory_quantity: formData.inventory_quantity,
        weight: formData.weight || null,
        weight_unit: formData.weight_unit,
        active: formData.active,
        featured: formData.featured,
        updated_at: new Date().toISOString(),
      }

      let productId

      if (initialData) {
        // Update existing product
        const { error } = await supabase.from("products").update(productData).eq("id", initialData.id)

        if (error) throw error

        productId = initialData.id

        // Delete existing category associations
        await supabase.from("product_categories").delete().eq("product_id", productId)
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert({
            ...productData,
            created_at: new Date().toISOString(),
          })
          .select()

        if (error) throw error

        productId = data[0].id
      }

      // Add category associations
      if (formData.categoryIds.length > 0) {
        const categoryAssociations = formData.categoryIds.map((categoryId: string) => ({
          product_id: productId,
          category_id: categoryId,
        }))

        const { error } = await supabase.from("product_categories").insert(categoryAssociations)

        if (error) throw error
      }

      toast({
        title: initialData ? "Product updated" : "Product created",
        description: initialData
          ? "Your product has been updated successfully."
          : "Your product has been created successfully.",
      })

      router.push(`/dashboard/stores/${storeId}`)
    } catch (error: any) {
      toast({
        title: initialData ? "Error updating product" : "Error creating product",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Product URL
                  <span className="ml-1 text-sm text-slate-500">(this will be used in your product URL)</span>
                </Label>
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
              <div className="grid gap-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange("active")} />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="featured" checked={formData.featured} onCheckedChange={handleSwitchChange("featured")} />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="compare_at_price">Compare at Price</Label>
                  <Input
                    id="compare_at_price"
                    name="compare_at_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compare_at_price}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    name="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inventory_quantity">Inventory Quantity</Label>
                  <Input
                    id="inventory_quantity"
                    name="inventory_quantity"
                    type="number"
                    min="0"
                    value={formData.inventory_quantity}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight_unit">Weight Unit</Label>
                  <select
                    id="weight_unit"
                    name="weight_unit"
                    value={formData.weight_unit}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={formData.categoryIds.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/stores/${storeId}`)}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  )
}

