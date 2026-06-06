import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Ban,
  CheckCircle,
  X,
  Filter,
  UserPlus,
  Mail,
  Phone,
  User,
  Shield,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore, useAppStore } from '@/store';
import type { User as UserType, UserRole } from '@/types';
import { cn } from '@/lib/utils';

type RoleFilter = 'all' | UserRole;

const roleLabelMap: Record<UserRole, string> = {
  admin: '管理员',
  dean: '教务',
  teacher: '讲师',
  lecturer: '讲师',
  assistant: '助教',
  student: '学员',
  academic: '教务',
  guest: '访客',
};

const roleColorMap: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  dean: 'bg-purple-100 text-purple-700',
  teacher: 'bg-blue-100 text-blue-700',
  lecturer: 'bg-blue-100 text-blue-700',
  assistant: 'bg-cyan-100 text-cyan-700',
  student: 'bg-emerald-100 text-emerald-700',
  academic: 'bg-purple-100 text-purple-700',
  guest: 'bg-gray-100 text-gray-700',
};

type UserStatus = 'active' | 'inactive' | 'disabled';

interface UserFormData {
  id?: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  title: string;
  status: UserStatus;
}

const emptyFormData: UserFormData = {
  username: '',
  name: '',
  email: '',
  phone: '',
  role: 'student',
  department: '',
  title: '',
  status: 'active',
};

export default function UserManage() {
  const { user: currentUser } = useAuthStore();
  const { fetchUsers, users: allUsers } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyFormData);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const isAdmin = currentUser?.role === 'admin';

  const users = allUsers.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      u.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData(emptyFormData);
    setShowUserModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      department: user.department || '',
      title: user.title || '',
      status: user.status,
    });
    setFormData({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      department: user.department || '',
      title: user.title || '',
      status: user.status,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    console.log('保存用户:', formData);
    setShowUserModal(false);
    setEditingUser(null);
    setFormData(emptyFormData);
  };

  const handleToggleStatus = (userId: string, currentStatus: UserStatus) => {
    console.log(`切换用户状态: ${userId}, 当前: ${currentStatus}`);
  };

  const handleResetPassword = () => {
    console.log(`重置密码: ${resetPasswordUserId}, 新密码: ${newPassword}`);
    setResetPasswordUserId(null);
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary-600" />
            用户管理
          </h1>
          <p className="text-primary-500 mt-2">管理平台用户账号与权限</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-primary-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                <input
                  type="text"
                  placeholder="搜索姓名、账号、邮箱..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-primary-50/50 text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary-400" />
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: '全部' },
                    { key: 'admin', label: '管理员' },
                    { key: 'dean', label: '教务' },
                    { key: 'teacher', label: '讲师' },
                    { key: 'assistant', label: '助教' },
                    { key: 'student', label: '学员' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setRoleFilter(item.key as RoleFilter)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        roleFilter === item.key
                          ? 'bg-gradient-primary text-white shadow-glow'
                          : 'bg-primary-50 text-primary-600 hover:bg-primary-100',
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <div className="lg:ml-auto">
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={handleAddUser}
                  >
                    新增用户
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50/50 border-b border-primary-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    用户
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    账号
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    部门/班级
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    状态
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-right text-xs font-semibold text-primary-600 uppercase tracking-wider">
                      操作
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center text-primary-400">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>暂无用户数据</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-primary-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-10 h-10 rounded-full border-2 border-primary-100 object-cover bg-white"
                          />
                          <div>
                            <p className="font-medium text-primary-900">{user.name}</p>
                            <p className="text-xs text-primary-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-primary-700 font-mono text-sm">{user.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                          roleColorMap[user.role as UserRole],
                        )}>
                          <Shield className="h-3 w-3" />
                          {roleLabelMap[user.role as UserRole]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-primary-600 text-sm">{user.department || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 text-sm font-medium',
                          user.status === 'active' ? 'text-emerald-600' : 'text-red-600',
                        )}>
                          {user.status === 'active' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                          {user.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Edit2 className="h-4 w-4" />}
                              onClick={() => handleEditUser(user)}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Lock className="h-4 w-4" />}
                              onClick={() => {
                                setResetPasswordUserId(user.id);
                                setNewPassword('');
                              }}
                            >
                              重置密码
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              className={user.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}
                              onClick={() => handleToggleStatus(user.id, user.status)}
                            >
                              {user.status === 'active' ? '禁用' : '启用'}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-primary-100 flex items-center justify-between">
            <p className="text-sm text-primary-500">
              共 <span className="font-semibold text-primary-900">{users.length}</span> 条记录
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled>
                上一页
              </Button>
              <span className="px-3 py-1.5 text-sm bg-gradient-primary text-white rounded-lg font-medium">
                1
              </span>
              <Button variant="secondary" size="sm" disabled>
                下一页
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-primary-100 shrink-0">
              <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                {editingUser ? (
                  <><Edit2 className="h-6 w-6 text-primary-600" />编辑用户</>
                ) : (
                  <><UserPlus className="h-6 w-6 text-primary-600" />新增用户</>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="p-2 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入姓名"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    账号 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="请输入登录账号"
                      disabled={!!editingUser}
                      className={cn(
                        'w-full pl-12 pr-4 py-3 rounded-xl border text-primary-900 transition-all',
                        editingUser
                          ? 'border-primary-100 bg-primary-50/50 cursor-not-allowed'
                          : 'border-primary-200 bg-white placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent',
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="请输入邮箱"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    手机号
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="请输入手机号"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    角色 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none"
                    >
                      <option value="student">学员</option>
                      <option value="teacher">讲师</option>
                      <option value="assistant">助教</option>
                      <option value="dean">教务</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    部门/班级
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="请输入部门或班级"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    职称/头衔
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="如：高级讲师、平台管理员等"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-xl">
                <span className="text-sm font-medium text-primary-700">账号状态：</span>
                <button
                  onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    formData.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300',
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
                    formData.status === 'active' ? 'translate-x-6' : 'translate-x-0.5',
                  )} />
                </button>
                <span className={cn(
                  'text-sm font-medium',
                  formData.status === 'active' ? 'text-emerald-600' : 'text-gray-500',
                )}>
                  {formData.status === 'active' ? '启用' : '禁用'}
                </span>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-primary-100 bg-primary-50/50 shrink-0">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={handleSaveUser}
              >
                {editingUser ? '保存修改' : '创建用户'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordUserId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-primary-100">
              <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-primary-600" />
                重置密码
              </h3>
              <button
                onClick={() => {
                  setResetPasswordUserId(null);
                  setNewPassword('');
                }}
                className="p-2 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-primary-600 text-sm">
                请为该用户设置新的登录密码，用户下次登录时需使用新密码。
              </p>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  新密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少6位）"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-amber-700 text-xs">
                提示：建议生成一个强密码，并通过安全渠道告知用户。
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-primary-100 bg-primary-50/50">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setResetPasswordUserId(null);
                  setNewPassword('');
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={handleResetPassword}
                disabled={newPassword.length < 6}
              >
                确认重置
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
