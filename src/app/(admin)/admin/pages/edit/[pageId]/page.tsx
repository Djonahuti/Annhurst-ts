'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
// Removed Supabase; using Prisma-backed API endpoints
import { useParams, useRouter } from 'next/navigation'
import EditPhone from '@/components/Shared/Admin/EditPhone'
import AccordionPage from '@/components/AccordionPage'
import { useAuth } from '@/contexts/AuthContext'

interface Page {
  id: string
  title: string
  slug: string
  is_published: boolean
  meta_description: string | null
  text: string | null
  hero_big_black: string | null
  hero_big_primary: string | null
  hero_text: string | null
  hero_year: string | null
  hero_year_span: string | null
  hero_100: string | null
  hero_100_span: string | null
  hero_24: string | null
  hero_24_span: string | null
  hero_primary_button: string | null
  hero_secondary_button: string | null
  body_heading: string | null
  body_sub_heading: string | null
  body_first_text: string | null
  body_second_text: string | null
  body_heading2: string | null
  body_sub_heading2: string | null
  body_heading3: string | null
  body_sub_heading3: string | null
  body_heading4: string | null
  body_sub_heading4: string | null
  section_text: string | null
  section_head: string | null
  section_primary_btn: string | null
  section_secondary_btn: string | null
  team_img: string | null
  team_text: string | null
  team_role: string | null
  team_img2: string | null
  team_text2: string | null
  team_role2: string | null
  team_img3: string | null
  team_text3: string | null
  team_role3: string | null
  box_head: string | null
  box_text: string | null
  box_head2: string | null
  box_text2: string | null
  box_head3: string | null
  box_text3: string | null
  box_head4: string | null
  box_text4: string | null
  box_head5: string | null
  box_text5: string | null
  box_head6: string | null
  box_text6: string | null
  box_head7: string | null
  box_text7: string | null
  box_head8: string | null
  box_text8: string | null
  box_head9: string | null
  box_text9: string | null
  hp?: string[] | null
  fm?: string[] | null
}

type FormData = Partial<Page>

export default function PageEdit() {
  const { adminRole } = useAuth();
  const params = useParams()
  const id = params.pageId
  const router = useRouter();
  const canEdit = adminRole === 'admin' || adminRole === 'editor';
  const [formData, setFormData] = useState<FormData>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPage()
    } else {
      setIsLoading(false)
    }
  }, [id])

  const fetchPage = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/pages/${id}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setFormData(data)
    } catch (e) {
      toast.error('Error fetching page')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (id === 'new') {
        const res = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (!res.ok) throw new Error(await res.text())
        toast.success('Page created successfully')
      } else {
        const res = await fetch(`/api/pages/${id}` , {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (!res.ok) throw new Error(await res.text())
        toast.success('Page updated successfully')
      }
      router.push('/admin/pages')
    } catch (e) {
      toast.error('Error saving page')
    }
  }

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value } as FormData))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-screen-2xl mx-auto p-8">
      {/* Left: Edit Form */}
      <div className="flex-1 space-y-6 lg:max-w-3xl">
        <h1 className="text-2xl font-bold">{id === 'new' ? "Create Page" : "Edit Page"}</h1>
        {adminRole == 'viewer' && (
          <div className="text-md text-gray-500">
            Note: <span className='text-sm text-red-500'>You only have view access</span>
          </div>
        )}

        <AccordionPage formData={formData} handleChange={handleChange} />

        {/* Save Buttons */}
        <div className="flex space-x-4 pt-6">
          <Button variant="outline" onClick={() => router.push('/admin/pages')}>Cancel</Button>
          <Button
           disabled={!canEdit} 
           onClick={handleSave}
           className='text-gray-200'
          >
            Save
          </Button>
        </div>
      </div>

      {/* Right: Preview Sidebar (iPhone 15 Pro Max Prototype) */}
      <div className='hidden md:block'>
        <EditPhone page={formData} />
      </div>

    </div>
  )
}