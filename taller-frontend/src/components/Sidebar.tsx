import { NavLink, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Car,
  Warehouse,
  Boxes,
  Book,
  ShoppingCart,
  FileText,
  CalendarCheck,
  User,
  ChevronDown,
  Menu,
  ChevronsLeft,
} from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { usuario } = useAuth()
  const hasPermission = (roles: string[]) => !roles.length || roles.includes(usuario?.rol || '')

  return (
    <aside
      className={clsx(
        'h-screen border-r bg-white flex flex-col transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      <div className="h-14 border-b flex items-center px-3 gap-2">
        <button className="rounded p-2 hover:bg-gray-100" aria-label="Alternar menú" onClick={onToggle}>
          {collapsed ? <Menu size={20} /> : <ChevronsLeft size={20} />}
        </button>
        {!collapsed && <div className="text-sm font-semibold">Servicentro</div>}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        <SideLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" collapsed={collapsed} />
        <SideLink to="/productos" icon={<Package size={18} />} label="Productos" collapsed={collapsed} />
        <SideLink to="/ordenes" icon={<ClipboardList size={18} />} label="Órdenes" collapsed={collapsed} />
        <SideLink to="/clientes" icon={<Users size={18} />} label="Clientes" collapsed={collapsed} />
        <SideLink to="/vehiculos" icon={<Car size={18} />} label="Vehículos" collapsed={collapsed} />
        <SideLink to="/proveedores" icon={<Users size={18} />} label="Proveedores" collapsed={collapsed} disabled={!hasPermission(['ADMINISTRADOR'])} />
        <SideLink to="/bodegas" icon={<Warehouse size={18} />} label="Bodegas" collapsed={collapsed} disabled={!hasPermission(['ADMINISTRADOR'])} />
        <CollapsibleSideLink
          icon={<Boxes size={18} />}
          label="Inventario"
          collapsed={collapsed}
          basePath="/inventarios"
        >
          <SideLink to="/inventarios/existencias" label="Existencias" collapsed={collapsed} isSubmenu />
          <SideLink to="/inventarios/ajustes" label="Ajustes" collapsed={collapsed} isSubmenu disabled={!hasPermission(['ADMINISTRADOR', 'SECRETARIA'])} />
          <SideLink to="/compras/nueva" label="Registrar Compra" collapsed={collapsed} isSubmenu disabled={!hasPermission(['ADMINISTRADOR'])} />
          <SideLink to="/inventarios/movimientos" label="Movimientos" collapsed={collapsed} isSubmenu />
        </CollapsibleSideLink>
        <SideLink to="/ventas" icon={<ShoppingCart size={18} />} label="Ventas" collapsed={collapsed} />
        <SideLink to="/facturacion" icon={<FileText size={18} />} label="Facturación" collapsed={collapsed} disabled={!hasPermission(['ADMINISTRADOR', 'SECRETARIA'])} />
        <SideLink to="/caja" icon={<FileText size={18} />} label="Caja" collapsed={collapsed} disabled={!hasPermission(['ADMINISTRADOR', 'SECRETARIA'])} />
        <SideLink to="/cierres" icon={<CalendarCheck size={18} />} label="Cierres" collapsed={collapsed} disabled={!hasPermission(['ADMINISTRADOR', 'SECRETARIA'])} />
        <CollapsibleSideLink
          icon={<Book size={18} />}
          label="Catálogos"
          collapsed={collapsed}
          basePath="/catalogos"
          disabled={!hasPermission(['ADMINISTRADOR', 'SECRETARIA'])}
        >
          <SideLink to="/catalogos/categorias" label="Categorías" collapsed={collapsed} isSubmenu />
          <SideLink to="/catalogos/marcas" label="Marcas" collapsed={collapsed} isSubmenu />
          <SideLink to="/catalogos/asignacion" label="Asignación" collapsed={collapsed} isSubmenu />
        </CollapsibleSideLink>
        <SideLink to="/usuarios" icon={<User size={18} />} label="Usuarios" collapsed={collapsed} disabled={!hasPermission(['ADMINISTRADOR'])} />
      </nav>

      <div className="p-3 text-xs text-gray-500 border-t">{!collapsed && <div>v1.0</div>}</div>
    </aside>
  )
}

function SideLink({
  to,
  label,
  icon,
  collapsed,
  disabled,
  isSubmenu,
}: {
  to: string
  label: string
  icon?: ReactNode
  collapsed: boolean
  disabled?: boolean
  isSubmenu?: boolean
}) {
  const base = 'flex items-center gap-3 py-2 text-sm hover:bg-gray-100'
  const linkClasses = isSubmenu ? 'px-10' : 'px-3'

  if (disabled) {
    return (
      <div className={clsx(base, linkClasses, 'text-gray-400 cursor-not-allowed')}>
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(base, linkClasses, isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700')
      }
      end
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

function CollapsibleSideLink({
  icon,
  label,
  collapsed,
  basePath,
  children,
  disabled,
}: {
  icon: ReactNode
  label: string
  collapsed: boolean
  basePath: string
  children: ReactNode
  disabled?: boolean
}) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(basePath)
  const [isOpen, setIsOpen] = useState(isActive)

  const base = 'flex items-center gap-3 px-3 py-2 text-sm'

  if (collapsed) {
    return <div className={clsx(base, 'text-gray-700', disabled && 'text-gray-400 cursor-not-allowed')}>
      {icon}
    </div>
  }
  
  if (disabled) {
    return (
      <div className={clsx(base, 'w-full', 'text-gray-400 cursor-not-allowed')}>
        {icon}
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div>
      <button
        className={clsx(base, 'w-full hover:bg-gray-100', isActive ? 'text-blue-700 font-medium' : 'text-gray-700')}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown
          size={16}
          className={clsx('ml-auto transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
        />
      </button>
      {isOpen && <div className="flex flex-col">{children}</div>}
    </div>
  )
}

