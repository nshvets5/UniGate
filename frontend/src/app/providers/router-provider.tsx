import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../router/require-auth';
import { AdminLayout } from '../../layouts/admin-layout';
import { DashboardPage } from '../../pages/dashboard-page';
import { GroupsPage } from '../../pages/groups-page';
import { StudentsPage } from '../../pages/students-page';
import { StudentDetailsPage } from '../../pages/student-details-page';
import { ZonesPage } from '../../pages/zones-page';
import { LoginPage } from '../../pages/login-page';

export function RouterProviderWrapper() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                <Route element={<RequireAuth />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="groups" element={<GroupsPage />} />

                        <Route path="students">
                            <Route index element={<StudentsPage />} />
                            <Route path=":id" element={<StudentDetailsPage />} />
                        </Route>

                        <Route path="zones" element={<ZonesPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}