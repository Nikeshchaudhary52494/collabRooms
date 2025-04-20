import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <div className="flex flex-col bg-white">

      <Navbar />
      <section className="flex flex-col items-center h-[calc(100vh-3.5rem)] bg-[radial-gradient(ellipse_at_top,theme(colors.blue.200),theme(colors.white))]  text-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            collabRooms is now in beta →
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
          Collaborative Coding Classroom
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
          Teach and learn programming in real-time with interactive code execution,
          collaborative editing, and instant feedback.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/create-room">Start Teaching</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            <Link href="/join-room">Join as Student</Link>
          </Button>
        </div>
      </section>

      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Collaboration",
                description: "See edits as they happen with multiple cursors and live updates.",
                icon: "👥"
              },
              {
                title: "Interactive Execution",
                description: "Run code directly from the editor with results visible to all participants.",
                icon: "⚡"
              },
              {
                title: "Multi-language Support",
                description: "Supports JavaScript, Python, Java, C, C++ and more.",
                icon: "💻"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/create-room">Create Your First Classroom</Link>
        </Button>
      </section>
    </div>
  );
}