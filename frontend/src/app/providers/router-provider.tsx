import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../../layouts/admin-layout';
import { DashboardPage } from '../../pages/dashboard-page';

export function RouterProviderWrapper() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}