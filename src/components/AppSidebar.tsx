
import { NavLink, useLocation } from 'react-router-dom'
import { Image, Youtube, FileText, MessageSquare, Sparkles, Home, Key } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Image to Quiz", url: "/dashboard/image-quiz", icon: Image },
  { title: "YouTube to Quiz", url: "/dashboard/youtube-quiz", icon: Youtube },
  { title: "PDF to Quiz", url: "/dashboard/pdf-quiz", icon: FileText },
  { title: "Text to Quiz", url: "/dashboard/text-quiz", icon: MessageSquare },
  { title: "Prompt to Quiz", url: "/dashboard/prompt-quiz", icon: Sparkles },
  { title: "API Keys", url: "/dashboard/api-keys", icon: Key },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard"
    }
    return currentPath.startsWith(path)
  }

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-black text-white hover:bg-gray-800" 
      : "text-gray-700 hover:bg-gray-100"
  }

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-gray-200">
        <SidebarTrigger className="mb-2" />
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-black">QuizAI</span>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quiz Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${getNavClass(item.url)}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
