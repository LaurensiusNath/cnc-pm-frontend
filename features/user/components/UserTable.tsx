import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { userRoleBadgeClassName, userRoleOptions } from "../schema";
import type { User } from "../types";

function roleLabel(role: User["role"]) {
  return userRoleOptions.find((opt) => opt.value === role)?.label ?? role;
}

interface UserTableProps {
  users: User[];
}

// No per-row link - there's no user detail page (only List + Create in
// this wave, edit/delete don't exist on the backend yet).
export function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>
              <Badge variant="outline" className={userRoleBadgeClassName[user.role]}>
                {roleLabel(user.role)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
