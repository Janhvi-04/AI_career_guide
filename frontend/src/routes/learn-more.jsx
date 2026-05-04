import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';
export const Route = createFileRoute('/learn-more')({
  component: Learn_more,
})

function Learn_more() {
  return (
    <>
    <div className="absolute top-6 left-6">
        <Link to="/" className="text-gray-600 hover:text-black">
          <ArrowLeft className="h-6 w-6" />
        </Link>
    </div>
    <section className='min-h-screen px-6 pt-20 pb-10 max-w-5xl mx-auto'>
        <h1 className='text-4xl md:text-5xl font-bold text-center'>Learn More About{" "} <span className='text-gradient'>CareerGuide AI</span></h1>
        <p className='mt-6 text-lg text-muted-foreground text-center max-w-2xl mx-auto'>A smarter way to explore careers, understand your strengths, and build
          a clear path toward your future.
        </p>
        <div className='mt-16'>
            <h2 className='text-2xl font-semibold'>How It Works</h2>
            <ol className='space-y-3 text-muted-foreground'>
                <li>1. Share your interests, skills, and goals</li>
                <li>2. Get AI-powered career recommendations</li>
                <li>3. Identify your skill gaps</li>
                <li>4. Follow a personalized roadmap</li>
                <li>5. Track your progress and improve continuously</li>
            </ol>
        </div>
        <div className='mt-14'>
            <h2 className='text-2xl font-semibold'>Why Choose Us</h2>
            <ul className=' space-y-3 text-muted-foreground'>
                <li><strong>AI Career Matching:</strong> Find careers aligned with your personality and skills.</li>
                <li><strong>Skill Gap Analysis:</strong> Understand what you need to improve.</li>
                <li><strong>Personalized Learning Paths:</strong> Step-by-step guidance tailored to you.</li>
                <li><strong>Resume Feedback:</strong> Improve your chances with smart suggestions.</li>
            </ul>
        </div>
        <div className='mt-14'>
            <h2 className='text-2xl font-semibold'>Why It Matters</h2>
            <p className='text-muted-foreground'>Many students and professionals struggle with unclear career paths.
            CareerGuide AI removes confusion by providing structured guidance,
            helping you make confident and informed decisions.</p>
        </div>
        <div className='mt-14'>
            <h2 className='text-2xl font-semibold'>Who Can Use It</h2>
            <p className='text-muted-foreground'> Whether you are a student choosing your first career, or a professional
            planning a transition, this platform supports you at every stage of
            your journey.</p>
        </div>
    </section>
    <CtaSection/>
    </>
  );
}
