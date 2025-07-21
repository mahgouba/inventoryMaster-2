import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface ListItem {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ComprehensiveListsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dialog states
  const [importTypesDialogOpen, setImportTypesDialogOpen] = useState(false);
  const [statusesDialogOpen, setStatusesDialogOpen] = useState(false);
  const [ownershipTypesDialogOpen, setOwnershipTypesDialogOpen] = useState(false);

  // Form states
  const [newImportType, setNewImportType] = useState({ name: "", description: "" });
  const [newStatus, setNewStatus] = useState({ name: "", description: "", color: "#6b7280" });
  const [newOwnershipType, setNewOwnershipType] = useState({ name: "", description: "" });

  // Edit states
  const [editingImportType, setEditingImportType] = useState<ListItem | null>(null);
  const [editingStatus, setEditingStatus] = useState<ListItem | null>(null);
  const [editingOwnershipType, setEditingOwnershipType] = useState<ListItem | null>(null);

  // Queries
  const { data: importTypes = [] } = useQuery({
    queryKey: ["/api/import-types"],
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["/api/statuses"],
  });

  const { data: ownershipTypes = [] } = useQuery({
    queryKey: ["/api/ownership-types"],
  });

  // Mutations
  const createImportTypeMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/import-types", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/import-types"] });
      setNewImportType({ name: "", description: "" });
      setImportTypesDialogOpen(false);
      toast({ title: "تم إنشاء نوع الاستيراد بنجاح" });
    },
  });

  const updateImportTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/import-types/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/import-types"] });
      setEditingImportType(null);
      toast({ title: "تم تحديث نوع الاستيراد بنجاح" });
    },
  });

  const deleteImportTypeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/import-types/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/import-types"] });
      toast({ title: "تم حذف نوع الاستيراد بنجاح" });
    },
  });

  const createStatusMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/statuses", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/statuses"] });
      setNewStatus({ name: "", description: "", color: "#6b7280" });
      setStatusesDialogOpen(false);
      toast({ title: "تم إنشاء حالة السيارة بنجاح" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/statuses/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/statuses"] });
      setEditingStatus(null);
      toast({ title: "تم تحديث حالة السيارة بنجاح" });
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/statuses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/statuses"] });
      toast({ title: "تم حذف حالة السيارة بنجاح" });
    },
  });

  const createOwnershipTypeMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/ownership-types", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ownership-types"] });
      setNewOwnershipType({ name: "", description: "" });
      setOwnershipTypesDialogOpen(false);
      toast({ title: "تم إنشاء نوع الملكية بنجاح" });
    },
  });

  const updateOwnershipTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/ownership-types/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ownership-types"] });
      setEditingOwnershipType(null);
      toast({ title: "تم تحديث نوع الملكية بنجاح" });
    },
  });

  const deleteOwnershipTypeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/ownership-types/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ownership-types"] });
      toast({ title: "تم حذف نوع الملكية بنجاح" });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/inventory">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة للمخزون
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تحرير القوائم</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">إدارة شاملة لجميع قوائم البيانات</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="import-types" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import-types">أنواع الاستيراد</TabsTrigger>
            <TabsTrigger value="statuses">حالات السيارات</TabsTrigger>
            <TabsTrigger value="ownership-types">أنواع الملكية</TabsTrigger>
          </TabsList>

          {/* Import Types Tab */}
          <TabsContent value="import-types" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>أنواع الاستيراد</CardTitle>
                  <Dialog open={importTypesDialogOpen} onOpenChange={setImportTypesDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة نوع جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة نوع استيراد جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="import-type-name">الاسم</Label>
                          <Input
                            id="import-type-name"
                            value={newImportType.name}
                            onChange={(e) => setNewImportType(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="مثال: شخصي، شركة، مستعمل شخصي"
                          />
                        </div>
                        <div>
                          <Label htmlFor="import-type-description">الوصف (اختياري)</Label>
                          <Textarea
                            id="import-type-description"
                            value={newImportType.description}
                            onChange={(e) => setNewImportType(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="وصف تفصيلي لنوع الاستيراد"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 space-x-reverse">
                          <Button variant="outline" onClick={() => setImportTypesDialogOpen(false)}>
                            إلغاء
                          </Button>
                          <Button 
                            onClick={() => createImportTypeMutation.mutate(newImportType)}
                            disabled={!newImportType.name.trim()}
                          >
                            حفظ
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {importTypes.map((item: ListItem) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      {editingImportType?.id === item.id ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editingImportType.name}
                            onChange={(e) => setEditingImportType(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                          <Textarea
                            value={editingImportType.description || ""}
                            onChange={(e) => setEditingImportType(prev => prev ? { ...prev, description: e.target.value } : null)}
                            placeholder="الوصف"
                          />
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              size="sm" 
                              onClick={() => updateImportTypeMutation.mutate({ 
                                id: item.id, 
                                data: { name: editingImportType.name, description: editingImportType.description }
                              })}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingImportType(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <h3 className="font-medium">{item.name}</h3>
                              <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "نشط" : "مخفي"}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingImportType(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateImportTypeMutation.mutate({ 
                                id: item.id, 
                                data: { isActive: !item.isActive }
                              })}
                            >
                              {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteImportTypeMutation.mutate(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Statuses Tab */}
          <TabsContent value="statuses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>حالات السيارات</CardTitle>
                  <Dialog open={statusesDialogOpen} onOpenChange={setStatusesDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة حالة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة حالة سيارة جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="status-name">الاسم</Label>
                          <Input
                            id="status-name"
                            value={newStatus.name}
                            onChange={(e) => setNewStatus(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="مثال: متوفر، في الطريق، قيد الصيانة"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status-color">اللون</Label>
                          <Input
                            id="status-color"
                            type="color"
                            value={newStatus.color}
                            onChange={(e) => setNewStatus(prev => ({ ...prev, color: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status-description">الوصف (اختياري)</Label>
                          <Textarea
                            id="status-description"
                            value={newStatus.description}
                            onChange={(e) => setNewStatus(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="وصف تفصيلي لحالة السيارة"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 space-x-reverse">
                          <Button variant="outline" onClick={() => setStatusesDialogOpen(false)}>
                            إلغاء
                          </Button>
                          <Button 
                            onClick={() => createStatusMutation.mutate(newStatus)}
                            disabled={!newStatus.name.trim()}
                          >
                            حفظ
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statuses.map((item: ListItem) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      {editingStatus?.id === item.id ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editingStatus.name}
                            onChange={(e) => setEditingStatus(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                          <Input
                            type="color"
                            value={editingStatus.color || "#6b7280"}
                            onChange={(e) => setEditingStatus(prev => prev ? { ...prev, color: e.target.value } : null)}
                          />
                          <Textarea
                            value={editingStatus.description || ""}
                            onChange={(e) => setEditingStatus(prev => prev ? { ...prev, description: e.target.value } : null)}
                            placeholder="الوصف"
                          />
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              size="sm" 
                              onClick={() => updateStatusMutation.mutate({ 
                                id: item.id, 
                                data: { 
                                  name: editingStatus.name, 
                                  description: editingStatus.description,
                                  color: editingStatus.color
                                }
                              })}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingStatus(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: item.color || "#6b7280" }}
                              />
                              <h3 className="font-medium">{item.name}</h3>
                              <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "نشط" : "مخفي"}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingStatus(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ 
                                id: item.id, 
                                data: { isActive: !item.isActive }
                              })}
                            >
                              {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteStatusMutation.mutate(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ownership Types Tab */}
          <TabsContent value="ownership-types" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>أنواع الملكية</CardTitle>
                  <Dialog open={ownershipTypesDialogOpen} onOpenChange={setOwnershipTypesDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة نوع جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة نوع ملكية جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ownership-type-name">الاسم</Label>
                          <Input
                            id="ownership-type-name"
                            value={newOwnershipType.name}
                            onChange={(e) => setNewOwnershipType(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="مثال: ملك الشركة، وسيط"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ownership-type-description">الوصف (اختياري)</Label>
                          <Textarea
                            id="ownership-type-description"
                            value={newOwnershipType.description}
                            onChange={(e) => setNewOwnershipType(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="وصف تفصيلي لنوع الملكية"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 space-x-reverse">
                          <Button variant="outline" onClick={() => setOwnershipTypesDialogOpen(false)}>
                            إلغاء
                          </Button>
                          <Button 
                            onClick={() => createOwnershipTypeMutation.mutate(newOwnershipType)}
                            disabled={!newOwnershipType.name.trim()}
                          >
                            حفظ
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ownershipTypes.map((item: ListItem) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      {editingOwnershipType?.id === item.id ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editingOwnershipType.name}
                            onChange={(e) => setEditingOwnershipType(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                          <Textarea
                            value={editingOwnershipType.description || ""}
                            onChange={(e) => setEditingOwnershipType(prev => prev ? { ...prev, description: e.target.value } : null)}
                            placeholder="الوصف"
                          />
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              size="sm" 
                              onClick={() => updateOwnershipTypeMutation.mutate({ 
                                id: item.id, 
                                data: { name: editingOwnershipType.name, description: editingOwnershipType.description }
                              })}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingOwnershipType(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <h3 className="font-medium">{item.name}</h3>
                              <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "نشط" : "مخفي"}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingOwnershipType(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOwnershipTypeMutation.mutate({ 
                                id: item.id, 
                                data: { isActive: !item.isActive }
                              })}
                            >
                              {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteOwnershipTypeMutation.mutate(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}