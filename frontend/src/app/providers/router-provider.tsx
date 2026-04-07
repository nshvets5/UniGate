import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../../layouts/admin-layout';
import { DashboardPage } from '../../pages/dashboard-page';
import { GroupsPage } from '../../pages/groups-page';
import { StudentsPage } from '../../pages/students-page';

export function RouterProviderWrapper() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="groups" element={<GroupsPage />} />
                    <Route path="students" element={<StudentsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}