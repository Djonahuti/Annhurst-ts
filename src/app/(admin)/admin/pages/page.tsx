'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Edit, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
// Removed Supabase; using internal API endpoints (Prisma-backed)
import { useAuth } from '@/contexts/AuthContext';

interface Page {
  id: string
  title: string
  slug: string
  hero_big_black: string
  meta_description: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function AdminPages() {
  const {adminRole} = useAuth();
  const [pages, setPages] = useState<Page[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/pages')
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setPages(data || [])
    } catch (e) {
      toast.error('Failed to fetch pages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}` , { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      setPages(prev => prev.filter(p => p.id !== id))
      toast.success('Page deleted successfully')
    } catch {
      toast.error('Error deleting page')
    }
  }

  const handleTogglePublish = async (id: string, status: boolean) => {
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !status })
      })
      if (!res.ok) throw new Error(await res.text())
      setPages(prev => prev.map(p => (p.id === id ? { ...p, is_published: !status } : p)))
      toast.success('Publish status updated')
    } catch {
      toast.error('Error updating publish status')
    }
  }

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="mt-2 text-gray-600">Manage your website pages and content</p>
        </div>
       {adminRole !== "viewer" ? ( 
        <Link href="/admin/pages/new">
          <Button className='text-gray-200'>New Page</Button>
        </Link>
        ):(
          <span className="text-gray-400 italic">Viewer</span>
        )}
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle>Search Pages</CardTitle>
          <CardDescription>Find and filter your website pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle>All Pages ({filteredPages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPages.map(page => (
            <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
              <div className="flex items-center space-x-4">
                <FileText className="h-6 w-6 text-gray-500" />
                <div>
                  <h3 className="font-semibold">{page.title}</h3>
                  <p className="text-sm text-gray-500">/{page.slug}</p>
                  <p className="text-xs text-gray-400">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Updated {new Date(page.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                 variant={page.is_published ? "default" : "secondary"}
                className="px-2 py-1 text-sm text-gray-200"
                >
                  {page.is_published ? "Published" : "Draft"}
                </Badge>
                <Link href={`/admin/pages/edit/${page.id}`}>
                  <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                </Link>
                {adminRole !== "viewer" ? (
                <> 
                <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(page.id, page.is_published)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
                </> 
                ):(
                  <span>.</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
