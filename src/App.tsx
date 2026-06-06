import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Layout } from '@/components/layout';
import Login from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import CourseList from '@/pages/Courses/CourseList';
import CourseDetail from '@/pages/Courses/CourseDetail';
import LiveList from '@/pages/Live/LiveList';
import LiveRoom from '@/pages/Live/LiveRoom';
import AssignmentList from '@/pages/Assignments/AssignmentList';
import AssignmentDetail from '@/pages/Assignments/AssignmentDetail';
import ExamList from '@/pages/Exams/ExamList';
import ExamTake from '@/pages/Exams/ExamTake';
import CertificateList from '@/pages/Certificates/CertificateList';
import AnalyticsPage from '@/pages/Analytics/AnalyticsPage';
import TeacherAudit from '@/pages/Teachers/TeacherAudit';
import ProfilePage from '@/pages/Profile/ProfilePage';
import UserManage from '@/pages/Users/UserManage';
import type { UserRole } from '@/types';

const roleNames: Record<UserRole, string> = {
  admin: '管理员',
  dean: '教务',
  teacher: '讲师',
  assistant: '助教',
  student: '学员',
  academic: '教务',
  lecturer: '讲师',
  guest: '访客',
};

function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: UserRole[] }) {
  const { isAuthenticated, user, canAccess } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !canAccess(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dark">
        <div className="text-center p-8 glass-card rounded-xl max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">访问受限</h2>
          <p className="text-gray-400 mb-4">
            当前角色为 <span className="text-primary-400 font-semibold">{user ? roleNames[user.role] : '未知'}</span>，
            无权访问此页面。
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return children;
}

function RouteListener() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/live" element={<LiveList />} />
          <Route path="/live/:id" element={<LiveRoom />} />
          <Route path="/assignments" element={<AssignmentList />} />
          <Route path="/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/exams/:id/take" element={<ExamTake />} />
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/:userId" element={<AnalyticsPage />} />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dean', 'teacher']}>
                <TeacherAudit />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
