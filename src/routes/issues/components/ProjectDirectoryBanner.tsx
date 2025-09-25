import React from 'react';
import { Paper, Grid, Typography, Button } from '@mui/material';

export type ProjectDirectoryBannerProps = {
  projectDir: string | null;
  onSelectDirectory: () => void;
};

export function ProjectDirectoryBanner(props: ProjectDirectoryBannerProps) {
  const { projectDir, onSelectDirectory } = props;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 'auto' }}>
          <Typography variant="body1">
            <strong>Project Directory:</strong>{' '}
            {projectDir || 'Not set. Please select a directory.'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 'auto' }}>
          <Button variant="contained" onClick={onSelectDirectory} size="small">
            {projectDir ? 'Change Directory' : 'Select Directory'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}