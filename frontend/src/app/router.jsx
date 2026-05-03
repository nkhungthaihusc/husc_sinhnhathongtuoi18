import { Navigate, Route, Routes } from 'react-router-dom';
import { Card, Result } from 'antd';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import PanelLayout from '../layouts/PanelLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminDashboardPage from '../pages/admin/DashboardPage.jsx';
import AdminMembersPage from '../pages/admin/MembersPage.jsx';
import AdminNotificationsPage from '../pages/admin/NotificationsPage.jsx';
import AdminProgramsPage from '../pages/admin/ProgramsPage.jsx';
import AdminRegistrationsPage from '../pages/admin/RegistrationsPage.jsx';
import AdminProfilePage from '../pages/admin/ProfilePage.jsx';
import AdminHistoryPage from '../pages/admin/HistoryPage.jsx';
import MemberDashboardPage from '../pages/member/DashboardPage.jsx';
import MemberHistoryPage from '../pages/member/HistoryPage.jsx';
import MemberNotificationsPage from '../pages/member/NotificationsPage.jsx';
import MemberProfilePage from '../pages/member/ProfilePage.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
import LookupPage from '../pages/public/LookupPage.jsx';
import ProgramsPage from '../pages/public/ProgramsPage.jsx';
import RegisterPage from '../pages/public/RegisterPage.jsx';

const memberLinks = [
  { to: '/member/dashboard', label: 'Tổng quan' },
  { to: '/member/profile', label: 'Hồ sơ cá nhân' },
  { to: '/member/notifications', label: 'Thông báo' },
  { to: '/member/history', label: 'Lịch sử hiến máu' }
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Tổng quan' },
  { to: '/admin/members', label: 'Thành viên' },
  { to: '/admin/profile', label: 'Hồ sơ cá nhân' },
  { to: '/admin/programs', label: 'Chương trình' },
  { to: '/admin/registrations', label: 'Đăng ký hiến máu' },
  { to: '/admin/history', label: 'Lịch sử hiến máu' },
  { to: '/admin/notifications', label: 'Thông báo' }
];

function NotFound() {
  return (
    <Card className="surface-card">
      <Result status="404" title="404" subTitle="Trang không tồn tại." />
    </Card>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/lookup" element={<LookupPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['member']} />}>
        <Route path="/member" element={<PanelLayout title="Thành viên" links={memberLinks} />}>
          <Route index element={<Navigate to="/member/dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboardPage />} />
          <Route path="profile" element={<MemberProfilePage />} />
          <Route path="notifications" element={<MemberNotificationsPage />} />
          <Route path="history" element={<MemberHistoryPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<PanelLayout title="Quản trị hệ thống" links={adminLinks} />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="programs" element={<AdminProgramsPage />} />
          <Route path="registrations" element={<AdminRegistrationsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="history" element={<AdminHistoryPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
