// Export all schemas from different modules
export * from './common';
export * from './personal';
export * from './creditAssessment';
export * from './newUser';
export * from './payment';
export * from './registration';

// Explicitly re-export otpSchema from login to resolve naming conflict
export { otpSchema as loginOtpSchema } from './login';
// Export other schemas from login (excluding otpSchema to avoid conflict)
