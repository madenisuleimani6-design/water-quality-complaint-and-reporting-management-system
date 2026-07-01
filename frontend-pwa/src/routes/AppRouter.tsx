import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { MobileFrame } from "@/components/layout/MobileFrame";
import { TabBar } from "@/components/layout/TabBar";
import { ReportPhotoProvider } from "@/contexts/ReportPhotoContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { AuthGuard } from "@/routes/AuthGuard";
import { ComplaintDetailPage } from "@/pages/ComplaintDetailPage";
import { HomePage } from "@/pages/HomePage";
import { MessagesPage } from "@/pages/MessagesPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { OtpPage } from "@/pages/OtpPage";
import { PhonePage } from "@/pages/PhonePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ReportConfirmPage } from "@/pages/ReportConfirmPage";
import { ReportPage } from "@/pages/ReportPage";
import { ReportSubmittedPage } from "@/pages/ReportSubmittedPage";
import { WelcomePage } from "@/pages/WelcomePage";

function TabShell() {
  useOfflineSync();

  return (
    <MobileFrame>
      <div className="flex h-dvh flex-col overflow-hidden">
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
        <TabBar />
      </div>
    </MobileFrame>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route
          path="/welcome"
          element={
            <MobileFrame>
              <WelcomePage />
            </MobileFrame>
          }
        />
        <Route
          path="/phone"
          element={
            <MobileFrame>
              <PhonePage />
            </MobileFrame>
          }
        />
        <Route
          path="/otp"
          element={
            <MobileFrame>
              <OtpPage />
            </MobileFrame>
          }
        />
        <Route
          path="/onboarding"
          element={
            <MobileFrame>
              <OnboardingPage />
            </MobileFrame>
          }
        />

        <Route element={<TabShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="/complaint/:id"
          element={
            <MobileFrame>
              <ComplaintDetailPage />
            </MobileFrame>
          }
        />

        <Route
          element={
            <ReportPhotoProvider>
              <Outlet />
            </ReportPhotoProvider>
          }
        >
          <Route
            path="/report"
            element={
              <MobileFrame variant="dark">
                <ReportPage />
              </MobileFrame>
            }
          />
          <Route
            path="/report/confirm"
            element={
              <MobileFrame>
                <ReportConfirmPage />
              </MobileFrame>
            }
          />
          <Route
            path="/report/submitted"
            element={
              <MobileFrame>
                <ReportSubmittedPage />
              </MobileFrame>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
