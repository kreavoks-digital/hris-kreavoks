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

  export const Tabs: DefineComponent<TabsProps>
  export const Button: DefineComponent<any>
  export const Badge: DefineComponent<any>
  export const Card: DefineComponent<any>
  export const DropdownMenu: DefineComponent<any>
  export const kreauiPlugin: any
}
