import { Header } from '@/components/Header';
import { Widget } from '@/components/Widget';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Widget title="Crypto">
            <div className="text-3xl font-bold text-center p-8">
              Price Here
            </div>
          </Widget>

          <Widget title="Stats">
            <div className="text-center p-8 text-gray-400">
              Stock Table Here
            </div>
          </Widget>
          <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 min-h-[200px] cursor-pointer hover:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full text-2xl font-bold">
                +
              </div>
              <p className="mt-2 font-semibold">Add Widget</p>
              <p className="text-sm text-gray-400">Connect to an API</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}