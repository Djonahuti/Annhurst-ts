'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface SettingsData {
  id: number;
  logo: string | null;
  logo_blk: string | null;
  footer_write: string | null;
  footer_head: string | null;
  footer_head2: string | null;
  services: string[] | null;
  phone: string[] | null;
  email: string[] | null;
  address: string | null;
  bottom_left: string | null;
  bottom_right: string[] | null;
}

type FormData = Partial<SettingsData>;

export default function SettingsEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.settingId as string;
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchSettings();
  }, [id]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFormData(data);
    } catch (err) {
      toast.error('Error loading settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (field: 'logo' | 'logo_blk', file: File) => {
    try {
      const oldFile = formData[field];
      if (typeof oldFile === 'string' && oldFile) {
        // Delete old file from public/settings/
        await fetch(`/api/upload/delete`, {
          method: 'POST',
          body: JSON.stringify({ filename: oldFile }),
        });
      }

      // Upload new file to public/settings/
      const form = new FormData();
      form.append('file', file);
      form.append('field', field);

      const uploadRes = await fetch('/api/upload/image', {
        method: 'POST',
        body: form,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const { filename } = await uploadRes.json();
      handleChange(field, filename);
      toast.success(`${field === 'logo' ? 'Logo' : 'Logo Black'} updated`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success('Settings updated successfully');
      router.push('/admin/settings');
    } catch (err) {
      toast.error('Error saving settings');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Edit Settings</h1>

      <div className="space-y-4">
        {/* Text Fields */}
          <Textarea
            placeholder="Address"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />
          <Input
            placeholder="Phone (comma separated)"
            value={formData.phone?.join(', ') || ''}
            onChange={(e) =>
              handleChange('phone', e.target.value.split(',').map((s) => s.trim()))
            }
          />
          <Input
            placeholder="Email (comma separated)"
            value={formData.email?.join(', ') || ''}
            onChange={(e) =>
              handleChange('email', e.target.value.split(',').map((s) => s.trim()))
            }
          />
          <Textarea
            placeholder="Footer Write"
            value={formData.footer_write || ''}
            onChange={(e) => handleChange('footer_write', e.target.value)}
          />
          <Input
            placeholder="Footer Head"
            value={formData.footer_head || ''}
            onChange={(e) => handleChange('footer_head', e.target.value)}
          />
          <Input
            placeholder="Footer Head 2"
            value={formData.footer_head2 || ''}
            onChange={(e) => handleChange('footer_head2', e.target.value)}
          />

          <Input
            placeholder="Services (comma separated)"
            value={formData.services?.join(', ') || ''}
            onChange={(e) =>
              handleChange('services', e.target.value.split(',').map((s) => s.trim()))
            }
          />
          <Textarea
            placeholder="Bottom Left"
            value={formData.bottom_left || ''}
            onChange={(e) => handleChange('bottom_left', e.target.value)}
          />
          <Input
            placeholder="Bottom Right (comma separated)"
            value={formData.bottom_right?.join(', ') || ''}
            onChange={(e) =>
              handleChange('bottom_right', e.target.value.split(',').map((s) => s.trim()))
            }
          />


          {/* Logo Upload */}
          <div>
            <label className="block font-medium">Main Logo</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
            />
            {formData.logo && (
              <div className="mt-2">
                <Image
                  src={`/settings/${formData.logo}`}
                  alt="Logo"
                  width={200}
                  height={80}
                  className="mt-2 bg-gray-50 bg-gradient-to-r dark:from-gray-400 dark:to-red-300"
                />
              </div>
            )}
          </div>

          {/* Logo Black Upload */}
          <div>
            <label className="block font-medium">Logo (Black)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('logo_blk', e.target.files[0])}
            />
            {formData.logo_blk && (
              <div className="mt-2">
                <Image
                  src={`/settings/${formData.logo_blk}`}
                  alt="Logo Black"
                  width={200}
                  height={80}
                  className="bg-gray-900/80 p-2"
                />
              </div>
            )}
            </div>
      </div>

      <div className="flex space-x-4 pt-6">
        <Button variant="outline" onClick={() => router.push('/admin/settings')}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="text-gray-200">Save</Button>
      </div>
    </div>
  );
}