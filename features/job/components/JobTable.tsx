import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { jobStatusOptions } from "../schema";
import type { Job } from "../types";

function statusLabel(status: Job["status"]) {
  return jobStatusOptions.find((opt) => opt.value === status)?.label ?? status;
}

interface JobTableProps {
  jobs: Job[];
}

export function JobTable({ jobs }: JobTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode Job</TableHead>
          <TableHead>Judul</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal Jadwal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell>
              <Link
                href={`/jobs/${job.id}`}
                className="font-medium hover:underline"
              >
                {job.job_code}
              </Link>
            </TableCell>
            <TableCell>{job.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{statusLabel(job.status)}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {job.scheduled_date ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
