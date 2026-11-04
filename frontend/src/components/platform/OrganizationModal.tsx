import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { type OrganizationResponse, organizationService } from '../../services/organizationService';

const orgSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(150, 'Name cannot exceed 150 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and single hyphens only'),
});

type OrgFormData = z.infer<typeof orgSchema>;

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationToEdit?: OrganizationResponse | null;
}

export const OrganizationModal: React.FC<OrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizationToEdit,
}) => {
  const isEditing = !!organizationToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (organizationToEdit) {
      setValue('name', organizationToEdit.name);
      setValue('slug', organizationToEdit.slug);
    } else {
      reset({ name: '', slug: '' });
    }
  }, [organizationToEdit, setValue, reset]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setValue('slug', generatedSlug);
    }
  };

  const onSubmit = async (data: OrgFormData) => {
    const loadingToast = toast.loading(isEditing ? 'Updating organization...' : 'Creating organization...');
    try {
      if (isEditing && organizationToEdit) {
        await organizationService.update(organizationToEdit.id, data);
        toast.success('Organization updated successfully!');
      } else {
        await organizationService.create(data);
        toast.success('Organization created successfully!');
      }
      toast.dismiss(loadingToast);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || 'Failed to save organization.';
      toast.error(errorMsg);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-500/20 text-emerald-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {isEditing ? 'Edit Organization' : 'Register New Organization'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isEditing ? 'Update enterprise tenant settings' : 'Provision a new multi-tenant gateway context'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Organization Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  onChange={handleNameChange}
                  placeholder="Acme Corporation"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>URL Slug</span>
                  <span className="text-[10px] text-gray-400 normal-case font-mono">Lowercase, numbers, hyphens</span>
                </label>
                <input
                  type="text"
                  {...register('slug')}
                  placeholder="acme-corp"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {errors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{errors.slug.message}</p>}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium shadow-md shadow-emerald-600/20 transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isEditing ? 'Save Changes' : 'Create Organization'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};