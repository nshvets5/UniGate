import { BrowserRouter, Route, Routes } from 'react-router-dom';

function LoginPage() {
    return <div>Login Page Works</div>;
}

function DashboardPage() {
    return <div>Dashboard Page Works</div>;
}

export function RouterProviderWrapper() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<DashboardPage />} />
            </Routes>
        </BrowserRouter>
    );
}