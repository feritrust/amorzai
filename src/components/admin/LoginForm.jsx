'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/app/admin/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? 'در حال بررسی…' : 'ورود'}
    </button>
  );
}

export default function LoginForm({ next = '/admin' }) {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          dir="ltr"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-sage-400"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
