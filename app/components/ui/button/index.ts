import { Button } from "@kreavoks/kreaui"
import type { ButtonProps } from "@kreavoks/kreaui"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { Button }
export type { ButtonProps }
export default Button

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
  {
    variants: {
      variant: {
        primary: "bg-[#4082E6] text-white hover:bg-[#2d6ed4] focus-visible:ring-[#4082E6]",
        default: "bg-[#4082E6] text-white hover:bg-[#2d6ed4] focus-visible:ring-[#4082E6]",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80",
        outline: "border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        link: "bg-transparent text-[#4082E6] font-semibold hover:underline",
        danger: "bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-500",
        destructive: "bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-500",
      },
      size: {
        xs: "h-8 px-3 text-xs gap-1",
        sm: "h-9 px-4 text-sm gap-1.5 [&_svg]:w-4 [&_svg]:h-4",
        default: "h-11 px-6 text-base gap-2 [&_svg]:w-5 [&_svg]:h-5",
        md: "h-11 px-6 text-base gap-2 [&_svg]:w-5 [&_svg]:h-5",
        lg: "h-14 px-10 text-2xl gap-2.5 [&_svg]:w-6 [&_svg]:h-6",
        xl: "h-16 px-12 text-2xl gap-3 [&_svg]:w-7 [&_svg]:h-7",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
