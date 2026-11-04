import React from 'react';
import { type UseFormRegister, type FieldErrors, type Control, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import type { RouteFormValues } from '../../schemas/routeSchema';
import { RoutePathPatternInput } from './RoutePathPatternInput';
import { organizationService } from '../../services/organizationService';

interface Props {
  register: UseFormRegister<RouteFormValues>;
  control: Control<RouteFormValues>;
  errors: FieldErrors<RouteFormValues>;
  isEditing: boolean;
}

export const RouteCoreAttributesSection: React.FC<Props> = ({ register, control, errors, isEditing }) => {

  const { data: orgData, isLoading: isOrgLoading } = useQuery({
    queryKey: ['tenant-organization'],
    queryFn: () => organizationService.getOwnOrganization(),
    staleTime: 1000 * 60 * 10, 
  });

  const tenantSlug = orgData?.slug || '';

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
        Core Route Attributes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">Route ID Identifier *</label>
          <input
            type="text"
            disabled={isEditing}
            {...register('routeId')}
            placeholder="e.g. user-service-v1"
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {errors.routeId && <span className="text-[11px] font-mono text-rose-600 mt-1 block">{errors.routeId.message}</span>}
          {isEditing && <span className="text-[10px] font-mono text-gray-400 mt-1 block">Route ID cannot be modified after creation.</span>}
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">Route Display Name *</label>
          <input
            type="text"
            {...register('name')}
            placeholder="e.g. User Management Service"
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {errors.name && <span className="text-[11px] font-mono text-rose-600 mt-1 block">{errors.name.message}</span>}
        </div>
      </div>

      <Controller
        name="pathPattern"
        control={control}
        render={({ field }) => (
          <RoutePathPatternInput
            tenantSlug={tenantSlug}
            value={field.value}
            onChange={field.onChange}
            error={errors.pathPattern?.message}
            isLoading={isOrgLoading}
          />
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">Target Base URL *</label>
          <input
            type="url"
            {...register('targetBaseUrl')}
            placeholder="https://backend.internal.service"
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {errors.targetBaseUrl && <span className="text-[11px] font-mono text-rose-600 mt-1 block">{errors.targetBaseUrl.message}</span>}
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">Target Path Prefix</label>
          <input
            type="text"
            {...register('targetPathPrefix')}
            placeholder="e.g. /internal"
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};