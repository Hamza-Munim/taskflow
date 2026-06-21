import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'

export default function AppLayout({
  breadcrumb,
  children,
  onCreateProject,
  search,
  onSearchChange,
  toolbar,
}) {
  const { profile, signOut } = useAuth()
  const { projects } = useProjects()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-taskflow-bg lg:flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateProject={onCreateProject}
        profile={profile}
        projects={projects}
        signOut={signOut}
      />
      <div className="min-w-0 flex-1">
        <Navbar
          breadcrumb={breadcrumb}
          onMenuClick={() => setSidebarOpen(true)}
          search={search}
          onSearchChange={onSearchChange}
        >
          {toolbar}
        </Navbar>
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
