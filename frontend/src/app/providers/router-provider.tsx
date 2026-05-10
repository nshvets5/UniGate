import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../router/require-auth';
import { AdminLayout } from '../../layouts/admin-layout';
import { DashboardPage } from '../../pages/dashboard-page';
import { GroupsPage } from '../../pages/groups-page';
import { StudentsPage } from '../../pages/students-page';
import { StudentDetailsPage } from '../../pages/student-details-page';
import { ZonesPage } from '../../pages/zones-page';
import { LoginPage } from '../../pages/login-page';
import {AttemptsPage} from "../../pages/attempts-page.tsx";
import { ReadersPage } from '../../pages/readers-page';
import { ReaderDetailsPage } from '../../pages/reader-details-page';
import { ReaderEmulatorPage } from '../../pages/reader-emulator-page';
import { AuditPage } from '../../pages/audit-page';
import { TimetableBatchesPage } from '../../pages/timetable-batches-page';

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
                        <Route path="attempts" element={<AttemptsPage />} />
                        <Route path="readers" element={<ReadersPage  />} />
                        <Route path="readers/:id" element={<ReaderDetailsPage />} />
                        <Route path="readers" element={<ReadersPage />} />
                        <Route path="emulator" element={<ReaderEmulatorPage />} />
                        <Route path="audit" element={<AuditPage />} />
                        <Route path="timetable/batches" element={<TimetableBatchesPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}