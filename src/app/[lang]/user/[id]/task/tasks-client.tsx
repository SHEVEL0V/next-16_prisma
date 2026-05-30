/** @format */

"use client";

import { Box, Paper, Typography } from "@mui/material";
import { Grid } from "@/components/ui/grids";
import { PriorityBadge, type PriorityLevel } from "@/components/ui/utilities/priority-badge";
import type { GridColDef } from "@mui/x-data-grid";

export interface TaskRow {
  id: string;
  date: string;
  status: string;
  title: string;
  description: string | null;
  board_title: string;
  priority: PriorityLevel;
}

interface TasksClientProps {
  rows: TaskRow[];
  dict?: {
    title?: string;
    description?: string;
    board?: string;
    status?: string;
    priority?: string;
    created?: string;
    noTasks?: string;
    createTaskOnBoard?: string;
  };
}

/**
 * Tasks Client Component
 * Renders tasks grid with priority visualization and responsive layout
 */
export function TasksClient({ rows, dict }: TasksClientProps) {
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: dict?.title || "Title",
      flex: 2,
      minWidth: 200,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "description",
      headerName: dict?.description || "Description",
      flex: 2,
      minWidth: 250,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => params.value || "—",
    },
    {
      field: "board_title",
      headerName: dict?.board || "Board",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "status",
      headerName: dict?.status || "Status",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "priority",
      headerName: dict?.priority || "Priority",
      flex: 1,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <PriorityBadge
          priority={params.value as PriorityLevel}
          variant="filled"
          size="small"
          showIcon
        />
      ),
    },
    {
      field: "date",
      headerName: dict?.created || "Created",
      flex: 1,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
    },
  ];

  if (rows.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "background.default",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {dict?.noTasks || "No tasks found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dict?.createTaskOnBoard || "Create a task on a board to see it here"}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "& .MuiDataGrid-root": {
          border: "none",
          bgcolor: "background.paper",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid",
          borderColor: "divider",
        },
        "& .MuiDataGrid-columnHeader": {
          bgcolor: "background.default",
          fontWeight: 600,
          borderBottom: "2px solid",
          borderColor: "divider",
        },
      }}
    >
      <Grid data={rows} columns={columns} pageSize={25} disablePagination={false} fullScreen />
    </Box>
  );
}

export default TasksClient;
