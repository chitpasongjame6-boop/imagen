export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Product {id}</h1>
        <p className="text-sm text-gray-600">This route is ready for product detail content.</p>
      </div>
    </main>
  )
}
