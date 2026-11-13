import { z } from 'zod';

export const routeFormSchema = z.object({
  routeId: z.string().min(1, 'Route ID is required').max(100, 'Route ID cannot exceed 100 characters'),
  name: z.string().min(1, 'Route name is required').max(200, 'Route name cannot exceed 200 characters'),
  pathPattern: z.string().min(1, 'Path pattern is required').max(500, 'Path pattern cannot exceed 500 characters')
    .refine(val => !val.includes('//') && !val.includes('\\') && !val.includes('?') && !val.includes('#'), 'Invalid characters in path pattern'),
  targetBaseUrl: z.string().url('Must be a valid absolute HTTP or HTTPS URL').max(1000, 'URL is too long')
    .refine(val => {
      try {
        const uri = new URL(val);
        return (uri.protocol === 'http:' || uri.protocol === 'https:') && !uri.search && !uri.hash && (!uri.pathname || uri.pathname === '/');
      } catch {
        return false;
      }
    }, 'targetBaseUrl must be a valid absolute HTTP/HTTPS URL without path, query parameters, or fragments'),
  targetPathPrefix: z.string().max(500).optional().or(z.literal('')),
  requestsPerMinute: z.number().positive('Must be greater than 0'),
  responseTimeoutMs: z.number().positive('Must be greater than 0'),
  idempotencyEnabled: z.boolean(),
  allowedMethods: z.array(z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE'])).min(1, 'Select at least one HTTP method'),
  allowedOrigins: z.array(z.string()).refine(origins => {
    if (origins.includes('*') && origins.length > 1) return false;
    return origins.every(o => o === '*' || /^https?:\/\/.+/.test(o));
  }, 'Origins must start with http:// or https://, and "*" cannot be combined with other origins.'),
  headerRules: z.array(
    z.object({
      direction: z.enum(['REQUEST', 'RESPONSE']),
      action: z.enum(['ADD', 'SET', 'REMOVE']),
      headerName: z.string().max(200),
      headerValue: z.string().max(2000).optional().or(z.literal('')),
    }).superRefine((data, ctx) => {
      const isBlankRow = !data.headerName || data.headerName.trim() === '';
      if (isBlankRow && (data.headerValue === undefined || data.headerValue === '')) {
        return;
      }

      if (isBlankRow) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Header name is required',
          path: ['headerName'],
        });
      }

      if (data.action === 'REMOVE' && data.headerValue && data.headerValue.trim() !== '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'headerValue must be empty when action is REMOVE',
          path: ['headerValue'],
        });
      }

      if ((data.action === 'ADD' || data.action === 'SET') && (!data.headerValue || data.headerValue.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'headerValue is required for ADD and SET actions',
          path: ['headerValue'],
        });
      }
    })
  ),
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;