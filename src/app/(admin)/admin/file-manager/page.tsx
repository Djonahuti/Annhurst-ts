'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Folder,
  File,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  FolderOpen,
  Home,
} from 'lucide-react';
import { IconFileTypePdf, IconPhoto, IconVideo } from '@tabler/icons-react';
import { toast } from 'sonner';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified: string;
  path: string;
}

export default function FileManager() {
  const { user, role, adminRole, loading } = useAuth();
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('public');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pathHistory, setPathHistory] = useState<string[]>(['public']);

  // Redirect if not admin or if viewer
  useEffect(() => {
    if (!loading) {
      if (!user || role !== 'admin') {
        router.push('/login');
      } else if (adminRole === 'viewer') {
        router.push('/admin');
        toast.error('Viewers cannot access file manager');
      }
    }
  }, [user, role, adminRole, loading, router]);

  useEffect(() => {
    if (user && role === 'admin' && adminRole !== 'viewer') {
      fetchFiles(currentPath);
    }
  }, [currentPath, user, role, adminRole]);

  const fetchFiles = async (path: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data.files);
      setCurrentPath(data.currentPath);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (item: FileItem) => {
    if (item.type === 'directory') {
      const newPath = item.path;
      setPathHistory([...pathHistory, newPath]);
      setCurrentPath(newPath);
    }
  };

  const handleGoBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      const previousPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      setCurrentPath(previousPath);
    } else {
      setCurrentPath('public');
      setPathHistory(['public']);
    }
  };

  const handleGoHome = () => {
    setCurrentPath('public');
    setPathHistory(['public']);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'directory') {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    
    // Get file extension
    const extension = item.name.split('.').pop()?.toLowerCase();
    
    // Return icon based on file extension
    if (extension === 'pdf') {
      return <IconFileTypePdf className="h-5 w-5 text-red-500" stroke={2} />;
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <IconPhoto className="h-5 w-5 text-green-500" stroke={2} />;
    }
    
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return <IconVideo className="h-5 w-5 text-purple-500" stroke={2} />;
    }
    
    // Default file icon for other types
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handleViewFile = (item: FileItem) => {
    if (item.type === 'file') {
      // For files in public directory, serve via static path
      if (item.path.startsWith('public/')) {
        const publicPath = item.path.replace('public/', '/');
        window.open(publicPath, '_blank');
      } else {
        // For other files, use API route
        window.open(`/api/uploads/${encodeURIComponent(item.path)}`, '_blank');
      }
    }
  };

  const handleDownloadFile = (item: FileItem) => {
    if (item.type === 'file') {
      if (item.path.startsWith('public/')) {
        const publicPath = item.path.replace('public/', '/');
        const link = document.createElement('a');
        link.href = publicPath;
        link.download = item.name;
        link.click();
      } else {
        const link = document.createElement('a');
        link.href = `/api/uploads/${encodeURIComponent(item.path)}`;
        link.download = item.name;
        link.click();
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (adminRole === 'viewer') {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">File Manager</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage files and directories on your server
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGoHome} size="sm">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={() => fetchFiles(currentPath)} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              disabled={pathHistory.length <= 1}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span className="text-gray-500">/</span>
            {pathHistory.map((path, index) => (
              <div key={index} className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newHistory = pathHistory.slice(0, index + 1);
                    setPathHistory(newHistory);
                    setCurrentPath(path);
                  }}
                  className="text-sm"
                >
                  {path === 'public' ? 'public' : path.split('/').pop()}
                </Button>
                {index < pathHistory.length - 1 && <span className="text-gray-500">/</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Files and Directories</CardTitle>
          <CardDescription>Current path: {currentPath}</CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              This directory is empty
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Size</th>
                    <th className="text-left p-2">Modified</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleNavigate(item)}
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getFileIcon(item)}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-gray-500">
                          {item.type === 'directory' ? 'Directory' : 'File'}
                        </span>
                      </td>
                      <td className="p-2 text-right text-sm text-gray-500">
                        {formatFileSize(item.size)}
                      </td>
                      <td className="p-2 text-sm text-gray-500">
                        {formatDate(item.modified)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          {item.type === 'directory' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(item);
                              }}
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewFile(item);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(item);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

