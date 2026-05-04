import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { CtaSection } from '../components/CtaSection';
import about from "@/assets/about.png";
export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <>
        <div className="absolute top-6 left-6">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
                <ArrowLeft className="h-6 w-6" />
            </Link>
        </div>
        <section className='min-h-screen px-6 pb-10 pt-20 max-w-5xl mx-auto'>
            <h1 className='text-4xl md:text-5xl font-bold text-center heading-font'>About <span className='text-gradient'>CareerGuide AI</span></h1>
            <p className='mt-6 text-lg text-muted-foreground text-center max-w-2xl mx-auto'>
                CareerGuide AI helps students and professionals make informed career
                decisions using AI-powered insights, personalized recommendations, and
                structured learning paths.
            </p>
            <div className='mt-16 grid md:grid-cols-2 gap-12 items-center'>
                <div className='space-y-8 w-4/5'>
                    <div>
                        <h2 className='text-2xl font-semibold heading-font'>Our Mission</h2>
                        <p className='mt-2 text-muted-foreground'>Our mission is to simplify career decisions and help individuals
                        choose paths aligned with their skills, interests, and long-term goals.</p>
                    </div>
                    <div>
                        <h2 className='text-2xl font-semibold heading-font'>What We Do</h2>
                        <ul className='mt-2 list-disc list-inside text-muted-foreground space-y-1'>
                            <li>AI-driven career recommendations</li>
                            <li>Skill gap analysis and improvement plans</li>
                            <li>Personalized learning roadmaps</li>
                            <li>Real-time progress tracking and career insights</li>
                            <li>Guidance for real-world career growth</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className='text-2xl font-semibold heading-font'>Our Vision</h2>
                        <p className='mt-2 text-muted-foreground'> We aim to become a reliable AI companion that empowers individualsworldwide to build successful and meaningful careers.</p>
                    </div>
                </div>
                <div>
                    <img
                    src={about}
                    alt="Career guidance"
                    className="mt-10  md:w-full md:h-[500px] object-cover w-2/3 mx-auto rounded-3xl shadow-lg"
                    />
                </div>
            </div>
        </section>
        <CtaSection/>
    </>
  );
}
