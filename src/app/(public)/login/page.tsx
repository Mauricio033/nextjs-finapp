import { signIn } from './actions'

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <form action={signIn}>
        <input
          className="w-full border rounded p-2 mb-2"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        <input
          className="w-full border rounded p-2 mb-4"
          name="password"
          type="password"
          placeholder="********"
          required
        />
        <button className="w-full rounded bg-black text-white p-2">
          Sign in
        </button>
      </form>
    </div>
  )
}
