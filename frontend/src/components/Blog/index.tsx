import React from 'react';
import ArenaMainFigure from '../../assets/main_figure.png';
interface Author {
  name: string;
  role: string;
  href: string;
  imageUrl: string;
}

interface Category {
  title: string;
  href: string;
}

interface BlogPost {
  id: number;
  title: string;
  href: string;
  description: string;
  imageUrl: string;
  date: string;
  datetime: string;
  category: Category;
  time: string;
}

const Blog: React.FC = () => {
  const posts: BlogPost[] = [
    {
      id: 1,
      title: 'Computer Agent Arena',
      href: '/blog/computer-agent-arena',
      description:
        "Computer Agent Arena's infrastructure, leaderboard (tentative) and initial insights.",
      imageUrl:
        ArenaMainFigure,
      date: 'April 07, 2025',
      datetime: '2025-04-07',
      category: { title: 'Computer Agent Arena', href: '#' },
      time: '10 min'
    },
    // Add more posts as needed
  ];

  return (
    <div className="bg-transparent py-8 sm:py-8">
      <div className="mx-auto max-w-7xl px-2 lg:px-4">
        <div className="mx-auto max-w-4xl lg:max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">Computer Agent Arena Blog</h2>
          <div className="mt-16 space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="relative isolate flex flex-col gap-8 lg:flex-row grid grid-cols-5">
                <div className="relative w-full col-span-2">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-auto rounded-2xl bg-gray-50 object-contain"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                
                <div className="col-span-3 w-full">
                  <div className="flex items-center gap-x-4 text-md">
                    <time dateTime={post.datetime} className="text-gray-500">
                      {post.date}
                    </time>
                    {/* <a
                      href={post.category.href}
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                    >
                      {post.category.title}
                    </a> */}
                  </div>
                  
                  <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-2xl font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                      <a href={post.href}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-5 text-md leading-6 text-gray-600">{post.description}</p>
                    <p className="mt-5 text-sm leading-6 text-gray-600">{post.time} Read</p>
                  </div>
                  
                  {/* <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                    <div className="relative flex items-center gap-x-4">
                      <img src={post.author.imageUrl} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                      <div className="text-sm leading-6">
                        <p className="font-semibold text-gray-900">
                          <a href={post.author.href}>
                            <span className="absolute inset-0" />
                            {post.author.name}
                          </a>
                        </p>
                        <p className="text-gray-600">{post.author.role}</p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
