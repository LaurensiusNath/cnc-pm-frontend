"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useDeleteCustomer } from "../hooks/useDeleteCustomer";

interface DeleteCustomerDialogProps {
  customerId: string;
  customerName: string;
  onDeleted: () => void;
}

export function DeleteCustomerDialog({
  customerId,
  customerName,
  onDeleted,
}: DeleteCustomerDialogProps) {
  const deleteCustomer = useDeleteCustomer();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Hapus Customer
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus {customerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Customer ini akan dihapus dari daftar. Tindakan ini tidak bisa
            dibatalkan dari halaman ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteCustomer.isPending}
            onClick={() =>
              deleteCustomer.mutate(customerId, { onSuccess: onDeleted })
            }
          >
            {deleteCustomer.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
