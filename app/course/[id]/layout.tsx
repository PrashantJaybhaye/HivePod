import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  try {
    const courseSnap = await getDoc(doc(db, "courses", courseId));
    if (courseSnap.exists()) {
      const course = courseSnap.data();
      
      const title = `${course.title} | HivePod`;
      const description = course.description || "A premium course on HivePod.";
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hivepod.vercel.app';
      const url = `${siteUrl}/course/${courseId}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url,
          siteName: 'HivePod',
          type: 'website',
          images: [
            {
              url: `${siteUrl}/api/og?title=${encodeURIComponent(course.title)}&category=${encodeURIComponent(course.category || 'Technology')}&instructor=${encodeURIComponent(course.instructor || 'HivePod Faculty')}&difficulty=${encodeURIComponent(course.difficulty || 'Beginner')}`, 
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [`${siteUrl}/api/og?title=${encodeURIComponent(course.title)}&category=${encodeURIComponent(course.category || 'Technology')}&instructor=${encodeURIComponent(course.instructor || 'HivePod Faculty')}&difficulty=${encodeURIComponent(course.difficulty || 'Beginner')}`],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching course metadata:", error);
  }

  return {
    title: 'Course | HivePod',
    description: 'View course details on HivePod.',
  };
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
