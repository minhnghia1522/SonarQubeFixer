import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export type BatchFixProgressProps = {
  isRunning: boolean;
  processed: number;
  total: number;
};

export function BatchFixProgress(props: BatchFixProgressProps) {
  const { isRunning, processed, total } = props;
  if (!isRunning) return null;

  const value = total > 0 ? (processed / total) * 100 : 0;

  return (
    <Box sx={{ p: 2 }}>
      <LinearProgress variant="determinate" value={value} />
      <Typography variant="body2" sx={{ mt: 1 }}>
        Processing: {processed} / {total}
      </Typography>
    </Box>
  );
}