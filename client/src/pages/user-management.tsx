import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  ArrowRight,
  Home,
  UserCircle,
  LogOut,
  MoreVertical,
  Sun,
  Moon
} from "lucide-react";
import SystemGlassWrapper from "@/components/system-glass-wrapper";
import GlassBackground from "@/components/glass-background";
import type { User } from "@shared/schema";

interface UserWithStats extends User {
  createdAt: Date;
  lastLogin?: string;
}

export default function UserManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { darkMode, toggleDarkMode } = useTheme();
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user"
  });

  // Check authentication and role
  const userRole = localStorage.getItem("auth") === "admin" ? "admin" : "user";
  
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery<UserWithStats[]>({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; role: string }) => {
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: "تم إضافة المستخدم الجديد إلى النظام",
        variant: "default",
      });
      setNewUserOpen(false);
      setFormData({ username: "", password: "", role: "user" });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء المستخدم",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<User> }) => {
      return await apiRequest("PUT", `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث المستخدم بنجاح",
        description: "تم تحديث بيانات المستخدم",
        variant: "default",
      });
      setEditUserOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث المستخدم",
        description: error.message || "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم حذف المستخدم بنجاح",
        description: "تم حذف المستخدم من النظام",
        variant: "default",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف المستخدم",
        description: error.message || "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search and role
  const filteredUsers = users.filter((user: UserWithStats) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle form submission
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(formData);
  };

  const handleEditUser = (user: UserWithStats) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      role: user.role
    });
    setEditUserOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const updateData: Partial<User> = {
      role: formData.role
    };
    
    // Only update password if provided
    if (formData.password) {
      updateData.password = formData.password;
    }

    updateUserMutation.mutate({
      id: selectedUser.id,
      userData: updateData
    });
  };

  const handleDeleteUser = (user: UserWithStats) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.username}"؟`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  if (userRole !== "admin") {
    return null;
  }

  return (
    <SystemGlassWrapper>
      {/* Header */}
      <GlassBackground variant="header" className="shadow-sm border-b border-white/20 dark:border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white drop-shadow-sm">
                  <Home size={18} className="ml-2" />
                  الرئيسية
                </Button>
              </Link>
              <ArrowRight size={16} className="text-white/50" />
              <h1 className="text-lg font-semibold text-white drop-shadow-sm">إدارة المستخدمين</h1>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 text-white/70 hover:text-white drop-shadow-sm"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 text-white/70 hover:text-white drop-shadow-sm">
                    <UserCircle size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-dropdown-content">
                  <DropdownMenuItem className="text-sm text-white/70 cursor-default">
                    <UserCircle className="mr-2 h-4 w-4" />
                    المستخدم: أدمن
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                    onClick={() => {
                      localStorage.removeItem("auth");
                      navigate("/login");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </GlassBackground>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pr-16" dir="rtl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassBackground variant="container" className="p-3">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-white/80 drop-shadow-sm">
                إجمالي المستخدمين
              </h3>
              <Users className="h-4 w-4 text-blue-400 drop-shadow-sm" />
            </div>
            <div className="text-2xl font-bold text-white drop-shadow-sm">{users.length}</div>
          </GlassBackground>
          
          <GlassBackground variant="container" className="p-3">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-white/80 drop-shadow-sm">
                المدراء
              </h3>
              <ShieldCheck className="h-4 w-4 text-purple-400 drop-shadow-sm" />
            </div>
            <div className="text-2xl font-bold text-white drop-shadow-sm">
              {users.filter((user: UserWithStats) => user.role === "admin").length}
            </div>
          </GlassBackground>
          
          <GlassBackground variant="container" className="p-3">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-white/80 drop-shadow-sm">
                المستخدمون العاديون
              </h3>
              <Shield className="h-4 w-4 text-blue-400 drop-shadow-sm" />
            </div>
            <div className="text-2xl font-bold text-white drop-shadow-sm">
              {users.filter((user: UserWithStats) => user.role === "user").length}
            </div>
          </GlassBackground>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              placeholder="البحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 glass-search text-white placeholder:text-white/60"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 glass-container text-white border-white/20">
                <SelectValue placeholder="تصفية حسب الدور" className="text-white/80" />
              </SelectTrigger>
              <SelectContent className="glass-dropdown-content">
                <SelectItem value="all" className="text-white hover:bg-white/10">جميع الأدوار</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-white/10">مدير</SelectItem>
                <SelectItem value="user" className="text-white hover:bg-white/10">مستخدم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm border border-blue-400/30">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مستخدم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass-container border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white drop-shadow-sm">إضافة مستخدم جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white/90 drop-shadow-sm">اسم المستخدم</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="أدخل اسم المستخدم"
                    className="glass-search text-white placeholder:text-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90 drop-shadow-sm">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="أدخل كلمة المرور"
                    className="glass-search text-white placeholder:text-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white/90 drop-shadow-sm">الدور</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="glass-container text-white border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-dropdown-content">
                      <SelectItem value="user" className="text-white hover:bg-white/10">مستخدم عادي</SelectItem>
                      <SelectItem value="admin" className="text-white hover:bg-white/10">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button type="button" variant="outline" onClick={() => setNewUserOpen(false)} 
                          className="border-white/30 text-white/80 hover:bg-white/10 backdrop-blur-sm">
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}
                          className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm border border-blue-400/30">
                    {createUserMutation.isPending ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <GlassBackground variant="container" className="p-3">
          <div className="mb-4">
            <h2 className="text-white drop-shadow-sm font-semibold">قائمة المستخدمين</h2>
          </div>
          <div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-white/70 drop-shadow-sm mt-2">جاري التحميل...</p>
              </div>
            ) : (
              <div className="glass-table">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-right text-white/90 drop-shadow-sm">اسم المستخدم</TableHead>
                      <TableHead className="text-right text-white/90 drop-shadow-sm">الدور</TableHead>
                      <TableHead className="text-right text-white/90 drop-shadow-sm">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right text-white/90 drop-shadow-sm">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: UserWithStats) => (
                      <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white drop-shadow-sm">
                          {user.username}
                        </TableCell>
                        <TableCell>
                          <span className={`glass-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin" 
                              ? "bg-purple-500/20 text-purple-300 border-purple-400/30" 
                              : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                          }`}>
                            {user.role === "admin" ? "مدير" : "مستخدم"}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/70 drop-shadow-sm">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-SA") : "غير محدد"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-dropdown-content">
                              <DropdownMenuItem onClick={() => handleEditUser(user)} className="text-white hover:bg-white/10">
                                <Edit className="h-4 w-4 mr-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </GlassBackground>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent className="sm:max-w-md glass-container border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white drop-shadow-sm">تعديل المستخدم</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-white/90 drop-shadow-sm">اسم المستخدم</Label>
                <Input
                  id="edit-username"
                  type="text"
                  value={formData.username}
                  disabled
                  className="glass-search text-white/50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-white/90 drop-shadow-sm">كلمة المرور الجديدة (اختياري)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="اتركه فارغاً للاحتفاظ بكلمة المرور الحالية"
                  className="glass-search text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-white/90 drop-shadow-sm">الدور</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="glass-container text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown-content">
                    <SelectItem value="user" className="text-white hover:bg-white/10">مستخدم عادي</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-white/10">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)}
                        className="border-white/30 text-white/80 hover:bg-white/10 backdrop-blur-sm">
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}
                        className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm border border-blue-400/30">
                  {updateUserMutation.isPending ? "جاري التحديث..." : "تحديث المستخدم"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SystemGlassWrapper>
  );
}