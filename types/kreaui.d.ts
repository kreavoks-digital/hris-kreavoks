declare module '@kreavoks/kreaui' {
  import type { DefineComponent, Component } from 'vue'

  export interface TabItem {
    id: string
    label: string
    icon?: Component
    disabled?: boolean
  }

  export interface TabsProps {
    modelValue?: string
    items: TabItem[]
    variant?: 'pills' | 'underline' | 'separated'
    size?: 'sm' | 'md' | 'lg'
    class?: string
  }

  export interface BadgeProps {
    type?: 'label' | 'notification' | 'hint'
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'outline' | 'destructive'
    size?: 'sm' | 'md' | 'lg'
    rounded?: 'sm' | 'md' | 'lg' | 'full'
    appearance?: 'soft' | 'solid'
    iconOnly?: boolean
    class?: string
  }

  export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'default' | 'destructive' | 'white' | 'action' | string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'default' | 'icon' | string
    disabled?: boolean
    loading?: boolean
    icon?: boolean
    label?: string
    iconLeft?: any
    iconRight?: any
    class?: any
    as?: any
    asChild?: boolean
    type?: 'button' | 'submit' | 'reset'
    [key: string]: any
  }

  export interface DropdownMenuItem {
    id: string
    label: string
    icon?: any
    disabled?: boolean
    divider?: boolean
    variant?: 'danger'
  }

  export interface DropdownMenuProps {
    modelValue?: string
    items?: DropdownMenuItem[]
    triggerText?: string
    variant?: 'default' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    align?: 'left' | 'right'
    disabled?: boolean
    class?: string
  }

  export const Tabs: DefineComponent<TabsProps>
  export const Button: DefineComponent<ButtonProps>
  export const Badge: DefineComponent<BadgeProps>
  export const Card: DefineComponent<any>
  export const DropdownMenu: DefineComponent<DropdownMenuProps>
  export const kreauiPlugin: any
}
