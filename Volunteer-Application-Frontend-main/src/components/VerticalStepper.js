import React from "react";
import { Stepper, Step, StepLabel } from '@mui/material';

const VerticalStepper = ({ step }) => {
  const steps = [
    "Personal Information", 
    "Education & Experience",
    "Role & Availability", 
    "Additional Information", 
    "Identification"
  ];

  return (
    <Stepper 
      activeStep={step - 1} 
      orientation="vertical" 
      sx={{
        '& .MuiStepIcon-root': {
          color: 'gray', // Set default color for inactive circles
          '&.Mui-active': {
            color: '#FBBC05', // Color for the active circle
          },
          '&.Mui-completed': {
            color: '#FBBC05', // Color for completed circles
          },
        },
      }}
    >
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default VerticalStepper;
