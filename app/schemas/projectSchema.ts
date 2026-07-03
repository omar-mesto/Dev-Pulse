import { z } from 'zod'
 
export const step1Schema = z.object({
  title: z
    .string()
    .min(3, 'Project title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  team_size: z
    .number({ invalid_type_error: 'Team size must be a number' })
    .min(1, 'Team size must be at least 1')
    .max(50, 'Team size must not exceed 50'),
})
 
export const step2Schema = z.object({
  abstract: z
    .string()
    .min(20, 'Abstract must be at least 20 characters')
    .max(500, 'Abstract must not exceed 500 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
})
 
export const step3Schema = z.object({
  required_skills: z
    .array(z.string())
    .min(1, 'Please add at least one required skill'),
})
 
export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
} as const
 
export type Step1Data = typeof step1Schema._type
export type Step2Data = typeof step2Schema._type
export type Step3Data = typeof step3Schema._type