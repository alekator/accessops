'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { type FieldErrors, type Resolver, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { checkEmailUnique } from '@/entities/user/api/check-email-unique';
import { getUser } from '@/entities/user/api/get-user';
import { updateUser } from '@/entities/user/api/update-user';
import {
  EditUserFormSchema,
  type EditUserFormValues,
} from '@/entities/user/model/edit-user-schema';
import { logInfo } from '@/features/observability/model/client-logger';
import { applyOptimisticUserUpdate } from '@/features/users/edit-user/model/optimistic-update';
import { useUnsavedChangesGuard } from '@/shared/lib/use-unsaved-changes-guard';

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id;

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
  });

  const form = useForm<EditUserFormValues>({
    resolver: editUserFormResolver,
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      role: 'Viewer',
      status: 'Active',
      suspendReason: '',
    },
  });

  const initialEmail = userQuery.data?.email ?? '';

  useEffect(() => {
    if (!userQuery.data) {
      return;
    }
    form.reset({
      name: userQuery.data.name,
      email: userQuery.data.email,
      role: userQuery.data.role,
      status: userQuery.data.status,
      suspendReason: userQuery.data.suspendReason ?? '',
    });
  }, [form, userQuery.data]);

  useUnsavedChangesGuard(form.formState.isDirty && !form.formState.isSubmitSuccessful);

  const mutation = useMutation({
    mutationFn: (values: EditUserFormValues) =>
      updateUser({
        id: userId,
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        suspendReason: values.status === 'Suspended' ? values.suspendReason : undefined,
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['user', userId] });

      const rollback = applyOptimisticUserUpdate(queryClient, userId, {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        suspendReason: values.status === 'Suspended' ? values.suspendReason : undefined,
      });

      return { rollback };
    },
    onError: (error, _, context) => {
      context?.rollback();
      const message = error instanceof Error ? error.message : 'Failed to save user';
      toast.error(message);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['user', userId], updated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      logInfo('user_updated', { userId: updated.id, email: updated.email, status: updated.status });
      toast.success('User updated');
      router.push(`/users/${userId}`);
    },
  });

  const status = useWatch({
    control: form.control,
    name: 'status',
  });
  const role = useWatch({
    control: form.control,
    name: 'role',
  });

  if (userQuery.isLoading) {
    return <div className="text-sm text-zinc-500">Loading user...</div>;
  }

  if (userQuery.isError || !userQuery.data) {
    return <div className="text-sm text-red-600">Unable to load user for editing.</div>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Edit User</h2>
        <Link
          href={`/users/${userId}`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
        >
          Back to details
        </Link>
      </div>

      <form
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <FormField label="Name" error={form.formState.errors.name?.message}>
          <input
            aria-label="Name"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            {...form.register('name')}
          />
        </FormField>

        <FormField label="Email" error={form.formState.errors.email?.message}>
          <input
            aria-label="Email"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            {...form.register('email', {
              validate: async (value) => {
                if (!value || value === initialEmail) {
                  return true;
                }
                const result = await checkEmailUnique(value, userId);
                return result.isUnique || 'Email is already in use';
              },
            })}
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <select
              aria-label="Role"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              {...form.register('role')}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
          </FormField>

          <FormField label="Status" error={form.formState.errors.status?.message}>
            <select
              aria-label="Status"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              {...form.register('status')}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Invited">Invited</option>
            </select>
          </FormField>
        </div>

        {status === 'Suspended' ? (
          <FormField label="Suspend reason" error={form.formState.errors.suspendReason?.message}>
            <textarea
              aria-label="Suspend reason"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              rows={3}
              {...form.register('suspendReason')}
            />
          </FormField>
        ) : null}

        {role === 'Admin' ? (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Elevated permissions section is visible for Admin role.
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
          <span className="text-xs text-zinc-500">
            Optimistic update with rollback on server failure is enabled.
          </span>
        </div>
      </form>
    </section>
  );
}

const editUserFormResolver: Resolver<EditUserFormValues> = async (values) => {
  const parsed = EditUserFormSchema.safeParse(values);
  if (parsed.success) {
    return {
      values: parsed.data,
      errors: {},
    };
  }

  const errors: FieldErrors<EditUserFormValues> = {};
  parsed.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (typeof field !== 'string' || errors[field as keyof EditUserFormValues]) {
      return;
    }

    errors[field as keyof EditUserFormValues] = {
      type: issue.code,
      message: issue.message,
    };
  });

  return {
    values: {},
    errors,
  };
};

function FormField({
  children,
  label,
  error,
}: {
  children: React.ReactNode;
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-800">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
