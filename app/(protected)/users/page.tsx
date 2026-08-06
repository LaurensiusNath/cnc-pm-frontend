import { Suspense } from "react";

import { UserListPage } from "@/features/user/components/UserListPage";

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UserListPage />
    </Suspense>
  );
}
