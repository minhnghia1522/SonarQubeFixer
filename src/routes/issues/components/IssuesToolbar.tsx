import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';
import type { IssuesParams } from '../../../types/issues';
import { TYPE_OPTIONS, STATUS_OPTIONS } from '../constants';

type Severity = '' | 'INFO' | 'MINOR' | 'MAJOR' | 'CRITICAL' | 'BLOCKER';

export type IssuesToolbarProps = {
  search: string;
  severity: Severity;
  type: NonNullable<IssuesParams['types']>;
  statuses: NonNullable<IssuesParams['issueStatuses']>;
  setSearch: (v: string) => void;
  setSeverity: (v: Severity) => void;
  setType: (v: NonNullable<IssuesParams['types']>) => void;
  setStatuses: (v: NonNullable<IssuesParams['issueStatuses']>) => void;
  applyFilters: () => void;
};

export function IssuesToolbar(props: IssuesToolbarProps) {
  const {
    search,
    severity,
    type,
    statuses,
    setSearch,
    setSeverity,
    setType,
    setStatuses,
    applyFilters,
  } = props;

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={applyFilters}
            variant="outlined"
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Severity</InputLabel>
            <Select
              value={severity}
              label="Severity"
              onChange={(e) => setSeverity(e.target.value as Severity)}
              onBlur={applyFilters}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="BLOCKER">Blocker</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
              <MenuItem value="MAJOR">Major</MenuItem>
              <MenuItem value="MINOR">Minor</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              multiple
              value={type ?? []}
              label="Type"
              onChange={(e) => setType(e.target.value as NonNullable<IssuesParams['types']>)}
              onBlur={applyFilters}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>
                  <Checkbox checked={(type || []).indexOf(t) > -1} />
                  <ListItemText primary={t} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={statuses ?? []}
              label="Status"
              onChange={(e) => {
                const v = e.target.value;
                const arr = (typeof v === 'string' ? v.split(',') : (v as string[])) as NonNullable<
                  IssuesParams['issueStatuses']
                >;
                setStatuses(arr);
              }}
              onBlur={applyFilters}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={(statuses || []).indexOf(status as any) > -1} />
                  <ListItemText primary={status} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}