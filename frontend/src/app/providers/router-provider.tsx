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
import { TimetableImportPage } from '../../pages/timetable-import-page';
import { TimetableSyncPage } from '../../pages/timetable-sync-page';
import { SecurityProfilePage } from '../../pages/security-profile-page';
import { CommandPaletteProvider } from '../../widgets/command-palette/command-palette-provider';
import { RequireRole } from '../router/require-role';
import { appRoles } from '../../shared/auth/roles';

export function RouterProviderWrapper() {
    return (
        <BrowserRouter>
            <CommandPaletteProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                <Route element={<RequireAuth />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="profile/security" element={<SecurityProfilePage />} />

                        <Route element={<RequireRole roles={[appRoles.admin]} />}>
                            <Route path="groups" element={<GroupsPage />} />
                            <Route path="students" element={<StudentsPage />} />
                            <Route path="students/:id" element={<StudentDetailsPage />} />
                            <Route path="zones" element={<ZonesPage />} />
                            <Route path="attempts" element={<AttemptsPage />} />
                            <Route path="readers" element={<ReadersPage />} />
                            <Route path="readers/:id" element={<ReaderDetailsPage />} />
                            <Route path="emulator" element={<ReaderEmulatorPage />} />
                            <Route path="audit" element={<AuditPage />} />
                            <Route path="timetable/import" element={<TimetableImportPage />} />
                            <Route path="timetable/batches" element={<TimetableBatchesPage />} />
                            <Route path="timetable/sync" element={<TimetableSyncPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            </CommandPaletteProvider>
        </BrowserRouter>
    );
}