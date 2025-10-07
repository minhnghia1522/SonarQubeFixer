import React from 'react';
import { Toolbar, Box, FormControlLabel, Checkbox, Button } from '@mui/material';

export type IssuesSelectionBarProps = {
  selectAll: boolean;
  selectedCount: number;
  total: number;
  selectAllAcrossPages?: boolean;
  onToggleSelectAll: () => void;
  onFixSelected: () => void;
  disabled?: boolean;
};

export function IssuesSelectionBar(props: IssuesSelectionBarProps) {
  const {
    selectAll,
    selectedCount,
    total,
    selectAllAcrossPages,
    onToggleSelectAll,
    onFixSelected,
    disabled,
  } = props;

  return (
    <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <Box>
        <FormControlLabel
          control={<Checkbox checked={selectAll} onChange={onToggleSelectAll} />}
          label={`Select Page (${selectedCount} of ${total} selected)`}
        />
      </Box>
      <Button variant="contained" onClick={onFixSelected} disabled={disabled}>
        Fix Selected
      </Button>
    </Toolbar>
  );
}