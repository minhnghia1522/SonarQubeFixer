import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Button, Typography, Container, Paper } from "@mui/material";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormTextField from "../components/form-control/FormTextField";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

const validationSchema = z.object({
  sonarqubeUrl: z.string().url("Invalid URL format."),
  sonarqubeToken: z.string().min(1, "SonarQube Token is required."),
  sonarqubeOrganization: z
    .string()
    .min(1, "SonarQube Organization is required."),
});

type ValidationSchema = z.infer<typeof validationSchema>;

function SetupPage() {
  const methods = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    console.log("Form is valid:", data);
    // Handle form submission logic here
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
              autoFocus
            />
            <FormTextField
              margin="normal"
              required
              fullWidth
              name="sonarqubeToken"
              label="SonarQube Token"
              type="password"
              id="sonarqubeToken"
              autoComplete="current-password"
            />
            <FormTextField
              margin="normal"
              required
              fullWidth
              name="sonarqubeOrganization"
              label="SonarQube Organization"
              id="sonarqubeOrganization"
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
