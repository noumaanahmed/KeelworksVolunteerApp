import React from "react";
import { Stepper, Step, StepButton } from "@mui/material";

const VerticalStepper = ({ step, onStepClick, canStepNavigate = () => false, dark = false }) => {
  const steps = [
    "Personal Information",
    "Education & Experience",
    "Role & Availability",
    "Additional Information",
    "Identification",
  ];

  return (
    <Stepper
      activeStep={step - 1}
      orientation="vertical"
      sx={{
        '& .MuiStepIcon-root': {
          color: dark ? '#64748b' : 'gray',
          '&.Mui-active': {
            color: '#FBBC05',
          },
          '&.Mui-completed': {
            color: '#FBBC05',
          },
        },
        '& .MuiStepButton-root': {
          cursor: 'pointer',
          transition: 'transform 160ms ease, color 160ms ease',
          '&:hover': {
            transform: 'translateX(4px)',
          },
        },
        '& .MuiStepLabel-label': {
          color: dark ? '#cbd5e1' : '#4b5563',
          '&.Mui-active': {
            color: dark ? '#ffffff' : '#111827',
          },
          '&.Mui-completed': {
            color: dark ? '#e5edf7' : '#111827',
          },
        },
        '& .MuiStepConnector-line': {
          borderColor: dark ? '#475569' : '#bdbdbd',
        },
      }}
    >
      {steps.map((label, index) => {
        const targetStep = index + 1;
        const enabled = canStepNavigate(targetStep);

        return (
          <Step key={label} completed={targetStep < step}>
            <StepButton
              disabled={!enabled}
              onClick={() => enabled && onStepClick?.(targetStep)}
            >
              {label}
            </StepButton>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default VerticalStepper;
