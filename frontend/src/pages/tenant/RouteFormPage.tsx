import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { routeService, type RouteRequest } from '../../services/routeService';
import { routeFormSchema, type RouteFormValues } from '../../schemas/routeSchema';
import { GatewayLoader } from '../../components/common/GatewayLoader';
import { RouteCoreAttributesSection } from '../../components/routes/RouteCoreAttributesSection';
import { RouteTrafficSection } from '../../components/routes/RouteTrafficSection';
import { RouteMethodsSection } from '../../components/routes/RouteMethodsSection';
import { RouteHeaderRulesSection } from '../../components/routes/RouteHeaderRulesSection';
import { Network, ArrowLeft, Save } from 'lucide-react';
import { RouteOriginsSection } from '../../components/routes/RouteOriginsSection';

export default function RouteFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const { data: existingRoute, isLoading: isFetchingRoute, isError: isFetchError } = useQuery({
    queryKey: ['route', id],
    queryFn: () => routeService.findById(id!),
    enabled: isEditing,
    retry: false,
  });

  useEffect(() => {
    if (isEditing && isFetchError) {
      toast.error('Route not found');
      navigate('/tenant/routes/new', { replace: true });
    }
  }, [isEditing, isFetchError, navigate]);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitted } } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema) as any,
    defaultValues: {
      routeId: '',
      name: '',
      pathPattern: '',
      targetBaseUrl: '',
      targetPathPrefix: '',
      requestsPerMinute: 60,
      responseTimeoutMs: 5000,
      idempotencyEnabled: false,
      allowedMethods: ['GET', 'POST'],
      allowedOrigins: ['*'],
      headerRules: [],
    },
  });

  useEffect(() => {
    if (existingRoute) {
      reset({
        routeId: existingRoute.routeId,
        name: existingRoute.name,
        pathPattern: existingRoute.pathPattern,
        targetBaseUrl: existingRoute.targetBaseUrl,
        targetPathPrefix: existingRoute.targetPathPrefix || '',
        requestsPerMinute: existingRoute.requestsPerMinute || 60,
        responseTimeoutMs: existingRoute.responseTimeoutMs || 5000,
        idempotencyEnabled: existingRoute.idempotencyEnabled,
        allowedMethods: existingRoute.allowedMethods || [],
        allowedOrigins: existingRoute.allowedOrigins || [],
        headerRules: existingRoute.headerRules.map(rule => ({
          direction: rule.direction,
          action: rule.action,
          headerName: rule.headerName,
          headerValue: rule.action === 'REMOVE' ? '' : (rule.headerValue || ''),
        })),
      });
    }
  }, [existingRoute, reset]);

  const formatPayload = (data: RouteFormValues): RouteRequest => ({
    ...data,
    targetPathPrefix: data.targetPathPrefix || '',
    headerRules: data.headerRules.map(rule => ({
      direction: rule.direction,
      action: rule.action,
      headerName: rule.headerName,
      headerValue: rule.action === 'REMOVE' ? null : (rule.headerValue || null),
    })),
  });

  const createMutation = useMutation({
    mutationFn: (data: RouteFormValues) => routeService.create(formatPayload(data)),
    onSuccess: () => {
      toast.success('Route created successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      navigate('/tenant/routes');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create route');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RouteFormValues) => routeService.update(id!, formatPayload(data)),
    onSuccess: () => {
      toast.success('Route updated successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', id] });
      navigate('/tenant/routes');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update route');
    },
  });

  const onSubmit = (data: RouteFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditing && isFetchingRoute) {
    return <GatewayLoader text="Loading Route Configuration..." subtext="Fetching route specifications from proxy state" />;
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
              <Network className="w-3.5 h-3.5" /> Proxy Engine
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {isEditing ? `Edit Route — ${existingRoute?.routeId}` : 'Register New API Route'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <RouteCoreAttributesSection register={register} control={control} errors={errors} isEditing={isEditing} />

        <RouteTrafficSection register={register} control={control} errors={errors} />

        <Controller
          name="allowedMethods"
          control={control}
          render={({ field }) => (
            <RouteMethodsSection 
              selectedMethods={field.value} 
              onChange={field.onChange} 
              error={errors.allowedMethods?.message}
            />
          )}
        />

        <Controller
          name="headerRules"
          control={control}
          render={({ field }) => (
            <RouteHeaderRulesSection
              rules={field.value}
              onChange={field.onChange}
              errors={errors.headerRules}
              isSubmitted={isSubmitted}
            />
          )}
        />

        <Controller
          name="allowedOrigins"
          control={control}
          render={({ field }) => (
            <RouteOriginsSection
              allowedOrigins={field.value}
              onChange={field.onChange}
              error={errors.allowedOrigins?.message}
            />
          )}
        />

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/tenant/routes')}
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Route...' : isEditing ? 'Update Route Configuration' : 'Create Route'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}