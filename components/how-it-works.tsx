import { ArrowRight, ShoppingBag, Store, CreditCard } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Store className="h-10 w-10" />,
      title: "Create Your Store",
      description: "Sign up and create your own online store in minutes. Customize it to match your brand.",
    },
    {
      icon: <ShoppingBag className="h-10 w-10" />,
      title: "Add Your Products",
      description: "Upload your products with descriptions, images, and pricing. Manage your inventory easily.",
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Start Selling",
      description:
        "Share your store link and start selling. We handle payments and give you your earnings minus our commission.",
    },
  ]

  return (
    <section className="container px-4 md:px-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tighter">How It Works</h2>
        <p className="text-slate-500 dark:text-slate-400 md:text-lg">
          Get your online store up and running in three simple steps
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="mt-4 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

