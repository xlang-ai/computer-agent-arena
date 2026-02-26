import React from 'react';

const About = () => {
  const teamMembers = [
    {
      name: 'Bowen Wang @ HKU',
      link: 'https://bowenbryanwang.github.io/'
    },
    {
      name: 'Xinyuan Wang @ HKU',
      link: 'https://xinyuanwangcs.github.io/'
    },
    {
      name: 'Jiaqi Deng @ HKU',
      link: 'https://www.linkedin.com/in/jiaqideng?originalSubdomain=hk'
    },
    { name: 'Victor Zhong @ UWaterloo', link: 'https://www.victorzhong.com/'},
    {
      name: 'Tao Yu @ HKU',
      link: 'https://taoyds.github.io/'
    },
  ];
  const contributors = [
    { name: 'Tianbao Xie @ HKU', link: 'https://tianbaoxie.com/'},
    { name: 'Ryan Li @ Stanford', link: 'https://www.linkedin.com/in/ryan-li-a9b2761b8/'},
    { name: 'Yanzhe Zhang @ Stanford', link: 'https://stevenyzzhang.github.io/website/'},
    { name: 'Gavin Li @ Stanford', link: ''},
    { name: 'Toh Jing Hua @ NTU', link: 'https://github.com/ztjhz'},
  ];

  const collaborators = [
    {
      name: 'Zhiguo Wang @ AWS',
      link: 'https://zhiguowang.github.io/'
    },
    { name: 'Yi Zhang @ AWS', link: 'https://scholar.google.com/citations?user=sxs6h_wAAAAJ&hl=zh-CN'},
    { name: 'Yu Su @ OSU', link: 'https://ysu1989.github.io/'},
    { name: 'Diyi Yang @ Stanford', link: 'https://cs.stanford.edu/~diyiy/'},
    { name: 'Wei-Lin Chiang @ UC Berkeley', link: 'https://infwinston.github.io/'},
    { name: "Ion Stoica @ UC Berkeley", link: 'https://people.eecs.berkeley.edu/~istoica/'}
  ];

  const supporters = [
    // { name: 'Chatbot Arena', logo: '/assets/lmsys.png' },
    { name: 'AWS', logo: '/assets/aws.webp' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-2">
      {/* About Section */}
      <h1 className="text-2xl font-bold mb-8">About Us</h1>
      <p className="text-base text-gray-700 mb-8">
        Computer Agent Arena is an open-source online platform evaluating computer agents in real computer environments (based on our prior work on <a href="https://os-world.github.io/" className="text-blue-600 hover:underline">OSWorld</a>),
        developed by <a href="https://xlang.ai" className="text-blue-600 hover:underline">the XLANG Lab</a>. 
        We always welcome contributions from the community. If you're interested in collaboration, 
        we'd love to hear from you! Please contact us <a href="mailto:xlang.agentarena@gmail.com" className="text-blue-600 hover:underline">here</a>.
      </p>

      {/* Team Section */}
      <h2 className="text-2xl font-bold mb-4">Team</h2>
      <div className="flex flex-wrap gap-4 mb-8 text-center items-center">
        <span className="text-base font-semibold">Core Members</span>
        {teamMembers.map((member) => (
          <div key={member.name}>
            {member.link ? (
              <a href={member.link} className="hover:underline">
                {member.name} 
              </a>
            ) : (
              <span>{member.name}</span>
            )}
          </div>
        ))}
      </div>

      {/* Contributors Section */}
      
      <div className="flex flex-wrap gap-4 mb-4 text-center items-center">
        <span className="text-base font-semibold">Contributors</span>
        {contributors.map((contributor) => (
          <div key={contributor.name}>
            {contributor.link ? (
              <a href={contributor.link} className="hover:underline">
                {contributor.name}
              </a>
            ) : (
              <span>{contributor.name}</span>
            )}
          </div>
        ))}
      </div>

      {/* Collaborators Section */}
      <div className="flex flex-wrap gap-4 mb-8 text-center items-center">
        <span className="text-base font-semibold">Collaborators</span>
        {collaborators.map((collaborator) => (
          <div key={collaborator.name}>
            {collaborator.link ? (
              <a href={collaborator.link} className="hover:underline">
                {collaborator.name}
              </a>
            ) : (
              <span>{collaborator.name}</span>
            )}
          </div>
        ))}
      </div>

      {/* Supporters Section */}
      <h2 className="text-2xl font-bold mb-8">Supporters</h2>
      <p className="text-base text-gray-700 mb-8">
        
        We thank <a href="https://aws.amazon.com/" className="text-blue-600 hover:underline">Amazon AWS Bedrock</a> for their gift support.
        If you're interested in supporting our mission, we'd love to hear from you <a href="mailto:xlang.agentarena@gmail.com" className="text-blue-600 hover:underline">here</a>!
      </p>

      {/* Supporters Logo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {supporters.map((supporter) => (
          <div key={supporter.name} className="flex items-center justify-center">
            <img 
              src={supporter.logo} 
              alt={supporter.name}
              className="max-h-24 w-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
