import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantAdminService, type TenantAdminListItem } from '../../services/tenantAdminService';
import { tenantAdminModalSchema, type TenantAdminModalFormData } from '../../schemas/tenantAdminModalSchema';

interface TenantAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  userToEdit?: TenantAdminListItem | null;
}

export const TenantAdminModal: React.FC<TenantAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  userToEdit,
}) => {
  const isEditing = !!userToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TenantAdminModalFormData>({
    resolver: zodResolver(tenantAdminModalSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (userToEdit) {
      setValue('username', userToEdit.username);
      setValue('password', '');
    } else {
      reset({ username: '', password: '' });
    }
  }, [userToEdit, setValue, reset]);

  const onSubmit = async (data: TenantAdminModalFormData) => {

    if (!isEditing && (!data.password || data.password.length < 8)) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'Updating tenant user...' : 'Creating tenant user...');
    try {
      if (isEditing && userToEdit) {
        const payload = data.password ? data : { username: data.username };
        await tenantAdminService.update(userToEdit.id, payload);
        toast.success('Tenant user updated successfully!');
      } else {
        await tenantAdminService.create(organizationId, {
          username: data.username,
          password: data.password!,
        });
        toast.success('Tenant user created successfully!');
      }
      toast.dismiss(loadingToast);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to save tenant user.');
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
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-500/20 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {isEditing ? 'Edit Tenant User' : 'Add Tenant Administrator'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isEditing ? 'Update credentials for this workspace user' : 'Provision access credentials for organization'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  {...register('username')}
                  placeholder="tenant_admin_user"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
                {errors.username && <p className="text-xs text-red-500 mt-1 font-medium">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  {isEditing ? 'New Password (Optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
                {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>}
              </div>

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
                      <span>{isEditing ? 'Save Changes' : 'Create User'}</span>
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