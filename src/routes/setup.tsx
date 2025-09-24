import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormTextField from "../components/form-control/FormTextField";
import { useSnackbar } from "../contexts/SnackbarContext";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

const validationSchema = z.object({
  sonarqubeUrl: z.string().url("Invalid URL format."),
  sonarqubeToken: z.string().min(1, "SonarQube Token is required."),
  sonarqubeOrganization: z.string().optional(),
  openaiApiKey: z.string().optional(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

function SetupPage() {
  const { showSnackbar } = useSnackbar();
  const [showOpenaiApiKey, setShowOpenaiApiKey] = React.useState(false);
  const [showSonarqubeToken, setShowSonarqubeToken] = React.useState(false);

  const methods = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      sonarqubeUrl: localStorage.getItem("sonarqubeUrl") || "",
      sonarqubeToken: localStorage.getItem("sonarqubeToken") || "",
      sonarqubeOrganization:
        localStorage.getItem("sonarqubeOrganization") || "",
      openaiApiKey: localStorage.getItem("openaiApiKey") || "",
    },
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    try {
      Object.entries(data).forEach(([key, value]) => {
        const toStore =
          typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value);
        localStorage.setItem(key, toStore);
      });
      window.electronAPI.updateSonarQubeConfig(data);
      showSnackbar("Lưu cài đặt thành công!");
    } catch (err) {
      console.error(`Error saving to localStorage:`, err);
      showSnackbar("Lưu cài đặt thất bại!", "error");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          SonarQube Settings
        </Typography>
        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={methods.handleSubmit(onSubmit)}
            noValidate
            sx={{ mt: 1 }}
          >
            <FormTextField
              margin="normal"
              required
              fullWidth
              id="sonarqubeUrl"
              label="SonarQube URL"
              name="sonarqubeUrl"
              autoComplete="url"
            />
            <FormTextField
              margin="normal"
              required
              fullWidth
              name="sonarqubeToken"
              label="SonarQube Token"
              type={showSonarqubeToken ? "text" : "password"}
              id="sonarqubeToken"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle sonarqube token visibility"
                      onClick={() => setShowSonarqubeToken(!showSonarqubeToken)}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                    >
                      {showSonarqubeToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormTextField
              margin="normal"
              fullWidth
              name="sonarqubeOrganization"
              label="SonarQube Organization"
              id="sonarqubeOrganization"
            />
            <FormTextField
              margin="normal"
              fullWidth
              name="openaiApiKey"
              label="OpenAI API Key"
              type={showOpenaiApiKey ? "text" : "password"}
              id="openaiApiKey"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle openai api key visibility"
                      onClick={() => setShowOpenaiApiKey(!showOpenaiApiKey)}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                    >
                      {showOpenaiApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Save Settings
            </Button>
          </Box>
        </FormProvider>
      </Paper>
    </Container>
  );
}
