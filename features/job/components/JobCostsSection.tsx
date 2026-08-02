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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useDeleteJobCost } from "../hooks/useDeleteJobCost";
import { useJobCosts } from "../hooks/useJobCosts";
import { costTypeOptions } from "../schema";
import { AddJobCostForm } from "./AddJobCostForm";

function costTypeLabel(type: string) {
  return costTypeOptions.find((opt) => opt.value === type)?.label ?? type;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface JobCostsSectionProps {
  jobId: string;
}

export function JobCostsSection({ jobId }: JobCostsSectionProps) {
  const { data, isLoading } = useJobCosts(jobId);
  const deleteCost = useDeleteJobCost(jobId);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Biaya</h2>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : data && data.costs.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.costs.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>{costTypeLabel(cost.cost_type)}</TableCell>
                  <TableCell>{cost.description}</TableCell>
                  <TableCell>{cost.quantity}</TableCell>
                  <TableCell>{formatCurrency(cost.selling_price)}</TableCell>
                  <TableCell>{formatCurrency(cost.subtotal)}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="sm" />}
                      >
                        Hapus
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Hapus item biaya ini?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{cost.description}&quot; akan dihapus dari
                            daftar biaya job ini.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={deleteCost.isPending}
                            onClick={() => deleteCost.mutate(cost.id)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-6 text-sm">
            <span>
              Total Jual:{" "}
              <strong>{formatCurrency(data.meta.total_selling)}</strong>
            </span>
            <span>
              Margin: <strong>{formatCurrency(data.meta.total_margin)}</strong>
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada item biaya.</p>
      )}

      <AddJobCostForm jobId={jobId} />
    </div>
  );
}
