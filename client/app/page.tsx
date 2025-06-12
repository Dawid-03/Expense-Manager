import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Expense Manager</h1>
          <p className="text-gray-600">Track your finances with ease</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
