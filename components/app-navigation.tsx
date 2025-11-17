'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database, FileCode } from 'lucide-react'

export function AppNavigation() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/workspace') {
      return pathname === '/' || pathname.startsWith('/workspace')
    }
    return pathname.startsWith(path)
  }
  
  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center gap-1 px-4 h-14">
        <Link
          href="/workspace"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md transition-colors
            ${isActive('/workspace') 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }
          `}
        >
          <FileCode className="h-4 w-4" />
          <span className="text-sm font-medium">Workspace</span>
        </Link>
        
        <Link
          href="/sql-editor"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md transition-colors
            ${isActive('/sql-editor')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }
          `}
        >
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">SQL Editor</span>
        </Link>
      </div>
    </nav>
  )
}
