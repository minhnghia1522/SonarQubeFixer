import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import React from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useSnackbar } from "../contexts/SnackbarContext";
import z from "zod";
import FormTextField from "./form-control/FormTextField";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const validationSchema = z.object({
  sonarqubeUrl: z.string().url("Invalid URL format."),
  sonarqubeToken: z.string().min(1, "SonarQube Token is required."),
  sonarqubeOrganization: z.string().optional(),
  openaiApiKey: z.string().optional(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const SonarQubeSettingSetupForm = () => {
  const { showSnackbar } = useSnackbar();
  // const [showOpenaiApiKey, setShowOpenaiApiKey] = React.useState(false);
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
      showSnackbar("Settings saved successfully!");
    } catch (err) {
      console.error(`Error saving to localStorage:`, err);
      showSnackbar("Failed to save settings!", "error");
    }
  };

  return (
    <>
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
                    aria-label="Toggle SonarQube Token Visibility"
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
          {/* <FormTextField
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
          /> */}
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
    </>
  );
};

export default SonarQubeSettingSetupForm;
