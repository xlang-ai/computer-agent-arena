import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Sample tasks from the image
const taskExamples = [
  {
    id: 1,
    text: "Please help me edit the heading title of the first slide on this Google Slides to \"My Memo Card\"",
    isGood: true,
    category: "Daily Workflow",
    reason: "This is a good task because it's a specific computer action that involves manipulating Google Slides, which is a real application on the computer."
  },
  {
    id: 2,
    text: "Can you help me setup a new event today with test@example.com at 5PM, let's say the event name as \"Discussion\"",
    isGood: true,
    category: "Daily Workflow",
    reason: "This is a good task because it asks the agent to perform a specific calendar operation which is a common computer task."
  },
  {
    id: 3,
    text: "Create a spreadsheet and rename Sheet1 as \"Book Borrowing Records\". The table headers should be \"Book Title\", \"Author\", \"Borrower\", \"Borrowing Date\", and \"Return Date\". Then set the font color of the table headers to red.",
    isGood: true,
    category: "Daily Workflow",
    reason: "This is a good task because it involves creating and formatting a spreadsheet, which is a specific computer operation with clear steps."
  },
  {
    id: 4,
    text: "Read the main part of this paper (up to the \"Conclusion\" section on page 10) and take notes as you go. Once you are finished, compile your notes in a comprehensive paper overview and report back to me.",
    isGood: true,
    category: "Daily Workflow",
    reason: "This is a good task because it involves navigating through a document and performing note-taking operations on the computer."
  },
  {
    id: 5,
    text: "Generate an image with stable diffusion on huggingface spaces choose a prompt you like",
    isGood: true,
    category: "Professional Usage",
    reason: "This is a good task because it involves using a specific web application (Hugging Face) to perform an image generation task on the computer."
  },
  {
    id: 6,
    text: "Can you help me crop this image into square format as my social media avatar using GIMP?",
    isGood: true,
    category: "Professional Usage",
    reason: "This is a good task because it involves manipulating an image using GIMP software, which is a specific computer operation."
  },
  {
    id: 7,
    text: "Find the most popular repo of yesterday on Github and clone it to the computer.",
    isGood: true,
    category: "Professional Usage",
    reason: "This is a good task because it requires browsing GitHub and using git commands to clone a repository, which are real computer operations."
  },
  {
    id: 8,
    text: "Verify that I am human",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's not a computer-use task. It's asking the agent to perform verification which is not related to operating the computer."
  },
  {
    id: 9,
    text: "Tell me about the weather today",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's asking for information rather than asking the agent to perform an action on the computer."
  },
  {
    id: 10,
    text: "Play a gambling game",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's asking to play a game rather than perform a productive computer task, and may involve inappropriate content."
  },
  {
    id: 11,
    text: "hello agent how are you?",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's just a greeting, not asking the agent to perform any computer operation."
  },
  {
    id: 12,
    text: "are you openai made?",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's asking about the agent's identity rather than asking it to perform a computer task."
  },
  {
    id: 13,
    text: "suggest me a few names for my cute pet",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's asking for creative suggestions rather than performing an operation on the computer."
  },
  {
    id: 14,
    text: "who's the USA president?",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's asking for factual information rather than asking the agent to perform a computer task."
  },
  {
    id: 15,
    text: "open chrome",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's too simple and vague. Good tasks should be more specific about what to do after opening Chrome."
  },
  {
    id: 16,
    text: "turn off the pc",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it would end the session and prevent further evaluation of the agents."
  },
  {
    id: 17,
    text: "change the text to hjcdshckhsdbckh",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's too vague (which text?) and doesn't specify a meaningful computer operation."
  },
  {
    id: 18,
    text: "login into youtube",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's too simple and lacks specific details about what to do after logging in."
  },
  {
    id: 19,
    text: "buy me a coffee",
    isGood: false,
    category: "Bad Examples",
    reason: "This is not a good task because it's asking the agent to make a purchase, which is not appropriate for this platform."
  }
];

// Randomly select 3 good and 2 bad examples
const getRandomExamples = () => {
  const goodExamples = taskExamples.filter(task => task.isGood);
  const badExamples = taskExamples.filter(task => !task.isGood);
  
  // Shuffle and pick
  const shuffledGood = [...goodExamples].sort(() => 0.5 - Math.random());
  const shuffledBad = [...badExamples].sort(() => 0.5 - Math.random());
  
  return [
    shuffledGood[0], 
    shuffledGood[1],
    shuffledGood[2],
    shuffledBad[0],
    shuffledBad[1],
    shuffledBad[2]
  ].sort(() => 0.5 - Math.random()); // Randomize order
};

const ProlificIntro: React.FC = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [questions, setQuestions] = useState(() => getRandomExamples());
  const [answers, setAnswers] = useState({
    platformQuestion: '',
    initialStateQuestion: '',
    taskQuestions: {
      0: '',
      1: '',
      2: '',
      3: '',
      4: '',
      5: ''
    }
  });
  const [allCorrect, setAllCorrect] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user has scrolled to the bottom
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10;
      if (atBottom) {
        setHasScrolled(true);
      }
    }
  };

  // Handle answer changes
  const handleAnswerChange = (question: 'platformQuestion' | 'initialStateQuestion' | number, value: string) => {
    if (question === 'platformQuestion') {
      setAnswers(prev => ({
        ...prev,
        platformQuestion: value
      }));
    } else if (question === 'initialStateQuestion') {
      setAnswers(prev => ({
        ...prev,
        initialStateQuestion: value
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        taskQuestions: {
          ...prev.taskQuestions,
          [question]: value
        }
      }));
    }
  };

  // Check if all answers are correct
  useEffect(() => {
    const platformCorrect = answers.platformQuestion === 'No';
    const initialStateCorrect = answers.initialStateQuestion === 'No';
    
    const taskAnswersCorrect = Object.entries(answers.taskQuestions).every(([index, answer]) => {
      const questionIndex = parseInt(index);
      const isGoodTask = questions[questionIndex].isGood;
      return (isGoodTask && answer === 'Yes') || (!isGoodTask && answer === 'No');
    });
    
    const allAnswered = answers.platformQuestion !== '' && 
      answers.initialStateQuestion !== '' &&
      Object.values(answers.taskQuestions).every(answer => answer !== '');
    
    setAllCorrect(hasScrolled && platformCorrect && initialStateCorrect && taskAnswersCorrect && allAnswered);
  }, [answers, hasScrolled, questions]);

  const handleContinue = () => {
    // Preserve the Prolific parameters
    navigate(`/prolific-login${location.search}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-center mb-4">
          Computer Agent Arena - Simple & Fun Study
        </h1>
        
        <div 
          ref={contentRef} 
          onScroll={handleScroll} 
          className="flex-1 overflow-auto pr-2 pb-2 max-h-[70vh]"
        >
          <h2 className="text-xl font-semibold mt-4 mb-2">
            What is the goal of this project?
          </h2>
          <p className="mb-4">
            Computer Agent Arena is a simple platform where you compare AI agents that can use computers. Here's how it works:
          </p>

          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>We give you access to two identical cloud computers</li>
            <li>You suggest any computer task you're interested in</li>
            <li>Two anonymous AI agents will perform your task on the computers</li>
            <li>You watch their execution and see how they perform</li>
            <li>You evaluate which agent did better</li>
            <li>After your evaluation, you'll learn the identity of both agents and receive your completion code</li>
          </ol>

          <p className="mb-4">
            That's it! A fun and simple process that helps us build better AI agents.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            What should you do?
          </h2>
          <p className="mb-4">
            1. Think of a computer task from your daily life or explore our environment for ideas
          </p>
          <p className="mb-4">
            2. Make sure both computers are in the same starting state
          </p>
          <p className="mb-4">
            3. Type your task and watch both agents try to complete it
          </p>
          <p className="mb-4">
            4. Tell us which agent did better
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            What kind of tasks should you propose?
          </h2>
          <p className="mb-4">
            PLEASE CHECK <a href="https://docs.google.com/spreadsheets/d/1HBugb1YLUEJI3GrJNgzh_DAmtXmVM5QMySP4PGqHFVY/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">THIS SPREADSHEET</a> FOR GOOD EXAMPLES and BAD EXAMPLES.
          </p>
          <p className="mb-4">
            <strong>Good tasks are:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Real and practical, reflecting actual computer-use needs.</li>
            <li>Feasible and not repetitive.</li>
            <li>Creative and diverse, ideally inspired by your own computer usage.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            Important notes
          </h2>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Don't share personal information in your tasks</li>
            <li>You can submit multiple times (get a new completion code each time)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            FAQ:
          </h2>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="mb-2"><strong>What if the platform shows 'waiting' after clicking Connect?</strong></p>
            <p>This means the platform is busy. Please wait a few minutes or return later.</p>
          </div>

          {/* Understanding Check Section */}
          <div className="mt-8 border-t-2 border-gray-200 pt-3">
            <h2 className="text-xl font-semibold mb-4">Quick Check</h2>
            <p className="mb-4 text-red-600 font-medium">
              Please answer these questions correctly to continue to the study:
            </p>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-2">Is this platform just like chatgpt.com, so that I can query any questions that I like?</p>
              <div className="flex gap-4 mt-2 mb-3">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="platformQuestion" 
                    value="Yes" 
                    checked={answers.platformQuestion === 'Yes'}
                    onChange={() => handleAnswerChange('platformQuestion', 'Yes')}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="platformQuestion" 
                    value="No" 
                    checked={answers.platformQuestion === 'No'}
                    onChange={() => handleAnswerChange('platformQuestion', 'No')}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {answers.platformQuestion === 'Yes' && (
                <div className="mt-2 p-3 rounded bg-red-50 text-red-800 border border-red-200">
                  <p className="font-medium mb-1">✗ Incorrect!</p>
                  <p>This is not like ChatGPT where you can ask any questions. This platform is specifically for computer-use tasks that agents will perform on real computers.</p>
                </div>
              )}
              {answers.platformQuestion === 'No' && (
                <div className="mt-2 p-3 rounded bg-green-50 text-green-800 border border-green-200">
                  <p className="font-medium mb-1">✓ Correct!</p>
                  <p>This platform is specifically for computer-use tasks that agents will perform on real computers, not a general question-answering system like ChatGPT.</p>
                </div>
              )}
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-2">Can I propose a task if the initial states of the two computers are different?</p>
              <div className="flex gap-4 mt-2 mb-3">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="initialStateQuestion" 
                    value="Yes" 
                    checked={answers.initialStateQuestion === 'Yes'}
                    onChange={() => handleAnswerChange('initialStateQuestion', 'Yes')}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="initialStateQuestion" 
                    value="No" 
                    checked={answers.initialStateQuestion === 'No'}
                    onChange={() => handleAnswerChange('initialStateQuestion', 'No')}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {answers.initialStateQuestion === 'Yes' && (
                <div className="mt-2 p-3 rounded bg-red-50 text-red-800 border border-red-200">
                  <p className="font-medium mb-1">✗ Incorrect!</p>
                  <p>You need to ensure both computers have the same initial state to maintain fairness in the evaluation.</p>
                </div>
              )}
              {answers.initialStateQuestion === 'No' && (
                <div className="mt-2 p-3 rounded bg-green-50 text-green-800 border border-green-200">
                  <p className="font-medium mb-1">✓ Correct!</p>
                  <p>Both computers must have the same initial state to ensure a fair comparison between the two agents.</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium mt-6 mb-3">
              For each task below, indicate whether it's a good example of a task for this platform:
            </h3>
            <p className="mb-3 text-gray-600">
              These 6 examples include a mix of good and bad tasks. Review each one carefully.
            </p>
            
            {questions.map((question, index) => (
              <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">Task {index + 1}:</p>
                <p className="mb-3 p-3 bg-white rounded border border-gray-200">{question.text}</p>
                <p className="mb-2">Is this a good task for our platform?</p>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name={`question${index}`} 
                      value="Yes" 
                      checked={answers.taskQuestions[index as keyof typeof answers.taskQuestions] === 'Yes'}
                      onChange={() => handleAnswerChange(index, 'Yes')}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name={`question${index}`} 
                      value="No" 
                      checked={answers.taskQuestions[index as keyof typeof answers.taskQuestions] === 'No'}
                      onChange={() => handleAnswerChange(index, 'No')}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                {answers.taskQuestions[index as keyof typeof answers.taskQuestions] && (
                  <div className={`mt-2 p-3 rounded ${
                    (question.isGood && answers.taskQuestions[index as keyof typeof answers.taskQuestions] === 'Yes') || 
                    (!question.isGood && answers.taskQuestions[index as keyof typeof answers.taskQuestions] === 'No')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <p className="font-medium mb-1">
                      {(question.isGood && answers.taskQuestions[index as keyof typeof answers.taskQuestions] === 'Yes') || 
                       (!question.isGood && answers.taskQuestions[index as keyof typeof answers.taskQuestions] === 'No')
                        ? '✓ Correct!'
                        : '✗ Incorrect!'
                      }
                    </p>
                    <p>{question.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-center mt-6">
          {!hasScrolled && (
            <p className="text-amber-600 mb-2">Please scroll through all content</p>
          )}
          {hasScrolled && !allCorrect && (
            <p className="text-amber-600 mb-2">Please answer all questions correctly to continue</p>
          )}
          <button 
            className={`py-2 px-6 rounded-md text-white text-lg font-medium ${allCorrect ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!allCorrect}
            onClick={handleContinue}
          >
            {allCorrect ? 'Continue to Study' : 'Please complete all requirements'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProlificIntro; 