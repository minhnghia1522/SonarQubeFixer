import React from "react";
import { Snackbar, Alert, AlertProps } from "@mui/material";

interface AppSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertProps["severity"];
  autoHideDuration?: number;
}

const AppSnackbar: React.FC<AppSnackbarProps> = ({
  open,
  onClose,
  message,
  severity = "success",
  autoHideDuration = 3000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackbar;
