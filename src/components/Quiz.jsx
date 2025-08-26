import React, { useState, useEffect } from 'react';
import { Brain, Award, BookOpen, Clock, CheckCircle, XCircle, Download, RefreshCw, Star } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Chatbot from './Chatbot';

const Quiz = ({ user }) => {
  const [currentUser] = useState(user?.displayName || 'Nursing Student'); // Get from auth system
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [completedTopics, setCompletedTopics] = useState({}); // Track completed certifications
  const [loading, setLoading] = useState(true);

  // Load completed topics from localStorage and Firebase on component mount
  useEffect(() => {
    const loadCompletedTopics = async () => {
      try {
        // First, try to load from localStorage for immediate access
        const localCompleted = localStorage.getItem('nursemate_completed_topics');
        if (localCompleted) {
          setCompletedTopics(JSON.parse(localCompleted));
        }

        // Then, load from Firebase for authenticated users
        if (user?.uid) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.completedTopics) {
              const firebaseCompleted = userData.completedTopics;
              setCompletedTopics(firebaseCompleted);
              // Update localStorage with Firebase data
              localStorage.setItem('nursemate_completed_topics', JSON.stringify(firebaseCompleted));
            }
          }
        }
      } catch (error) {
        console.error('Error loading completed topics:', error);
        // Fallback to localStorage if Firebase fails
        const localCompleted = localStorage.getItem('nursemate_completed_topics');
        if (localCompleted) {
          setCompletedTopics(JSON.parse(localCompleted));
        }
      } finally {
        setLoading(false);
      }
    };

    loadCompletedTopics();
  }, [user]);

  // Save completed topics to both localStorage and Firebase
  const saveCompletedTopics = async (newCompletedTopics) => {
    try {
      // Save to localStorage immediately
      localStorage.setItem('nursemate_completed_topics', JSON.stringify(newCompletedTopics));
      
      // Save to Firebase for authenticated users
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          completedTopics: newCompletedTopics,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving completed topics:', error);
      // At least localStorage is saved
    }
  };

  const topics = [
    {
      id: 'anatomy',
      name: 'Anatomy & Physiology',
      description: 'Test your knowledge of human body systems and physiological processes',
      icon: '🫀',
      color: 'bg-red-500'
    },
    {
      id: 'pharmacology',
      name: 'Pharmacology',
      description: 'Master drug interactions, dosages, and medication administration',
      icon: '💊',
      color: 'bg-blue-500'
    },
    {
      id: 'pediatrics',
      name: 'Pediatric Nursing',
      description: 'Specialized care for infants, children, and adolescents',
      icon: '👶',
      color: 'bg-green-500'
    }
  ];

  const quizData = {
    anatomy: {
      questions: [
        {
          question: "Which chamber of the heart receives oxygenated blood from the lungs?",
          options: ["Right atrium", "Left atrium", "Right ventricle", "Left ventricle"],
          correct: 1
        },
        {
          question: "The largest bone in the human body is:",
          options: ["Tibia", "Humerus", "Femur", "Fibula"],
          correct: 2
        },
        {
          question: "Which organ produces bile?",
          options: ["Pancreas", "Gallbladder", "Liver", "Stomach"],
          correct: 2
        },
        {
          question: "The functional unit of the kidney is called:",
          options: ["Nephron", "Neuron", "Alveoli", "Hepatocyte"],
          correct: 0
        },
        {
          question: "Which part of the brain controls balance and coordination?",
          options: ["Cerebrum", "Cerebellum", "Medulla", "Thalamus"],
          correct: 1
        },
        {
          question: "How many chambers does the human heart have?",
          options: ["Two", "Three", "Four", "Five"],
          correct: 2
        },
        {
          question: "The smallest blood vessels are called:",
          options: ["Arteries", "Veins", "Capillaries", "Venules"],
          correct: 2
        },
        {
          question: "Which hormone regulates blood sugar levels?",
          options: ["Insulin", "Adrenaline", "Cortisol", "Thyroxine"],
          correct: 0
        },
        {
          question: "The voice box is also known as:",
          options: ["Pharynx", "Larynx", "Trachea", "Epiglottis"],
          correct: 1
        },
        {
          question: "Which muscle is responsible for breathing?",
          options: ["Intercostal", "Diaphragm", "Pectoralis", "Deltoid"],
          correct: 1
        }
      ]
    },
    pharmacology: {
      questions: [
        {
          question: "What is the therapeutic range for digoxin?",
          options: ["0.5-2.0 ng/mL", "1.0-2.5 ng/mL", "0.8-2.0 ng/mL", "1.5-3.0 ng/mL"],
          correct: 2
        },
        {
          question: "Which medication is a beta-blocker?",
          options: ["Lisinopril", "Metoprolol", "Amlodipine", "Furosemide"],
          correct: 1
        },
        {
          question: "The antidote for warfarin overdose is:",
          options: ["Protamine sulfate", "Vitamin K", "Naloxone", "Flumazenil"],
          correct: 1
        },
        {
          question: "Which route provides the fastest drug absorption?",
          options: ["Oral", "Intramuscular", "Intravenous", "Subcutaneous"],
          correct: 2
        },
        {
          question: "ACE inhibitors commonly cause which side effect?",
          options: ["Dry cough", "Weight gain", "Drowsiness", "Constipation"],
          correct: 0
        },
        {
          question: "The half-life of a drug refers to:",
          options: ["Time to reach peak effect", "Time for 50% elimination", "Duration of action", "Time to onset"],
          correct: 1
        },
        {
          question: "Which medication requires monitoring of INR levels?",
          options: ["Heparin", "Warfarin", "Aspirin", "Clopidogrel"],
          correct: 1
        },
        {
          question: "First-line treatment for anaphylaxis is:",
          options: ["Benadryl", "Epinephrine", "Corticosteroids", "Albuterol"],
          correct: 1
        },
        {
          question: "Which drug class can cause hyperkalemia?",
          options: ["Diuretics", "Beta-blockers", "ACE inhibitors", "Calcium channel blockers"],
          correct: 2
        },
        {
          question: "The maximum daily dose of acetaminophen for adults is:",
          options: ["2000mg", "3000mg", "4000mg", "5000mg"],
          correct: 2
        }
      ]
    },
    pediatrics: {
      questions: [
        {
          question: "At what age do most children begin walking independently?",
          options: ["8-10 months", "10-12 months", "12-15 months", "15-18 months"],
          correct: 2
        },
        {
          question: "The normal respiratory rate for a newborn is:",
          options: ["20-30 breaths/min", "30-60 breaths/min", "40-80 breaths/min", "60-100 breaths/min"],
          correct: 1
        },
        {
          question: "Which vaccine is given at birth?",
          options: ["MMR", "DTaP", "Hepatitis B", "Varicella"],
          correct: 2
        },
        {
          question: "The anterior fontanelle typically closes by:",
          options: ["6 months", "12 months", "18 months", "24 months"],
          correct: 2
        },
        {
          question: "Signs of dehydration in infants include:",
          options: ["Sunken fontanelle", "Decreased skin turgor", "Dry mucous membranes", "All of the above"],
          correct: 3
        },
        {
          question: "The recommended position for infant sleep is:",
          options: ["Side", "Prone", "Supine", "Any position"],
          correct: 2
        },
        {
          question: "Stranger anxiety typically begins around:",
          options: ["3-4 months", "6-8 months", "12-15 months", "18-24 months"],
          correct: 1
        },
        {
          question: "The first solid food recommended for infants is usually:",
          options: ["Rice cereal", "Fruits", "Vegetables", "Meat"],
          correct: 0
        },
        {
          question: "Normal heart rate for a toddler (1-3 years) is:",
          options: ["60-100 bpm", "80-130 bpm", "90-150 bpm", "100-180 bpm"],
          correct: 2
        },
        {
          question: "Which reflex disappears by 6 months of age?",
          options: ["Babinski", "Moro", "Rooting", "Gag"],
          correct: 1
        }
      ]
    }
  };

  const startQuiz = (topicId) => {
    if (completedTopics[topicId]) {
      return; // Don't allow retaking if already certified
    }
    
    setSelectedTopic(topicId);
    setCurrentQuiz(quizData[topicId]);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer('');
    setQuizCompleted(false);
    setScore(0);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    const newAnswers = [...answers, parseInt(selectedAnswer)];
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestion + 1 < currentQuiz.questions.length) {
    setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed, calculate score
      const correctAnswers = newAnswers.reduce((acc, answer, index) => {
        return acc + (answer === currentQuiz.questions[index].correct ? 1 : 0);
      }, 0);
      
      const finalScore = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
      setScore(finalScore);
      setQuizCompleted(true);

      // If score >= 80%, mark as completed for certification
      if (finalScore >= 80) {
        const newCompletedTopics = { ...completedTopics, [selectedTopic]: true };
        setCompletedTopics(newCompletedTopics);
        saveCompletedTopics(newCompletedTopics);
      }
    }
  };

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer('');
    setQuizCompleted(false);
    setScore(0);
  };

  const downloadCertificate = () => {
    generateAndDownloadCertificate();
  };

  const generateAndDownloadCertificate = () => {
    // Create canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (A4 ratio)
    canvas.width = 1200;
    canvas.height = 848;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f9ff'); // Light blue
    gradient.addColorStop(0.5, '#ffffff'); // White
    gradient.addColorStop(1, '#f0fdf4'); // Light green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add decorative medical-themed elements
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)'; // Light teal
    ctx.lineWidth = 2;
    
    // Stethoscope outline (left side)
    ctx.beginPath();
    ctx.arc(100, 200, 60, 0, Math.PI * 2);
    ctx.arc(100, 400, 60, 0, Math.PI * 2);
    ctx.moveTo(160, 200);
    ctx.lineTo(160, 400);
    ctx.stroke();
    
    // Heart outline (top right)
    ctx.beginPath();
    ctx.moveTo(1000, 150);
    ctx.bezierCurveTo(950, 100, 900, 120, 900, 180);
    ctx.bezierCurveTo(900, 240, 950, 260, 1000, 220);
    ctx.bezierCurveTo(1050, 260, 1100, 240, 1100, 180);
    ctx.bezierCurveTo(1100, 120, 1050, 100, 1000, 150);
    ctx.stroke();
    
    // ECG waveform (bottom)
    ctx.beginPath();
    ctx.moveTo(100, 700);
    for (let i = 0; i < 1000; i += 20) {
      const x = 100 + i;
      const y = 700 + Math.sin(i * 0.1) * 20 + (Math.random() - 0.5) * 10;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Border
    ctx.strokeStyle = '#06b6d4'; // Teal
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Inner border
    ctx.strokeStyle = '#0891b2'; // Darker teal
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // NurseMate Logo and Title
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NurseMate', canvas.width / 2, 120);
    
    // Certificate Title
    ctx.fillStyle = '#0f172a'; // Dark blue
    ctx.font = 'bold 64px Arial';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 220);
    
    // Recipient Name
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('This is to certify that', canvas.width / 2, 300);
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 56px Arial';
    ctx.fillText(currentUser, canvas.width / 2, 380);
    
    // Achievement Text
    ctx.fillStyle = '#475569'; // Gray
    ctx.font = '24px Arial';
    ctx.fillText('has successfully completed the', canvas.width / 2, 440);
    
    const topicName = topics.find(t => t.id === selectedTopic)?.name || 'Nursing Quiz';
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(topicName, canvas.width / 2, 480);
    
    ctx.fillStyle = '#475569';
    ctx.font = '24px Arial';
    ctx.fillText('and demonstrated outstanding knowledge in nursing care', canvas.width / 2, 520);
    
    // Score
    ctx.fillStyle = '#059669'; // Green
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Score: ${score}%`, canvas.width / 2, 580);
    
    // Date
    ctx.fillStyle = '#475569';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Date:', 200, 680);
    ctx.fillText(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), 200, 710);
    
    // Verification Seal
    ctx.save();
    ctx.translate(900, 680);
    
    // Seal background
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Seal text
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Verified by', 0, -10);
    ctx.fillText('NurseMate', 0, 10);
    ctx.restore();
    
    // Convert to PNG and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NurseMate_${topicName.replace(/\s+/g, '_')}_Certificate_${currentUser.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const Certificate = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-4xl w-full aspect-[4/3] relative overflow-hidden">
        {/* Certificate Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 border-4 border-teal-300 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-blue-300 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-green-300 rounded-full"></div>
          </div>
        </div>

        {/* Certificate Border */}
        <div className="absolute inset-4 border-2 border-teal-200 rounded-lg">
          <div className="h-full w-full p-8 flex flex-col justify-between">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-lg">+</span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">NurseMate</h1>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 mb-2">CERTIFICATE</h2>
              <h3 className="text-2xl font-bold text-gray-600 mb-8">OF ACHIEVEMENT</h3>
            </div>

            {/* Recipient Name */}
            <div className="text-center mb-8">
              <div className="text-4xl font-serif italic text-gray-800 mb-4">
                {currentUser}
              </div>
              <div className="w-64 h-px bg-gray-400 mx-auto"></div>
            </div>

            {/* Achievement Text */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-2">has successfully completed the</p>
              <p className="text-xl font-bold text-teal-600 mb-2">
                NurseMate {topics.find(t => t.id === selectedTopic)?.name} Quiz
              </p>
              <p className="text-lg text-gray-700">and demonstrated outstanding knowledge in nursing care.</p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Date</p>
                <div className="w-24 h-px bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="text-center">
                <div className="border-2 border-gray-400 rounded-full px-6 py-2">
                  <p className="text-sm text-gray-600 mb-1">Verified by</p>
                  <p className="font-bold text-gray-800">NurseMate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowCertificate(false)}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
        >
          <XCircle className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );

  // Show loading state while fetching completed topics
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quiz progress...</p>
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Nursing Knowledge Assessment</h1>
              <p className="text-gray-600 mt-2">Test your expertise and earn professional certifications</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Topic Selection</h3>
                  <p className="text-gray-600 text-sm">Anatomy, Pharmacology, Pediatrics</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quiz Format</h3>
                  <p className="text-gray-600 text-sm">10 MCQs per set</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Certification</h3>
                  <p className="text-gray-600 text-sm">Score above 80% to get certified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Topics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topics.map((topic) => (
              <div key={topic.id} className={`bg-white rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                completedTopics[topic.id] 
                  ? 'border-green-200 shadow-green-100' 
                  : 'border-gray-100'
              }`}>
                <div className={`h-2 ${topic.color} ${completedTopics[topic.id] ? 'bg-green-500' : ''}`}></div>
                <div className="p-6">
                  <div className="text-center mb-4 relative">
                    {completedTopics[topic.id] && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                    <div className="text-4xl mb-3">{topic.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.name}</h3>
                    <p className="text-gray-600 text-sm">{topic.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        ~15 minutes
                      </span>
                      <span className="flex items-center">
                        <Brain className="w-4 h-4 mr-1" />
                        10 questions
                      </span>
                    </div>
                    
                    {completedTopics[topic.id] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-2 px-4 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Certified ✓</span>
                        </div>
                        <div className="text-center text-sm text-gray-500 mb-2">
                          Quiz completed successfully
                        </div>
                        <button
                          onClick={downloadCertificate}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Certificate</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startQuiz(topic.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                      >
                        Start Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Validate Your Expertise?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Demonstrate your nursing knowledge and earn professional certifications recognized in the healthcare industry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const topic = topics.find(t => t.id === selectedTopic);
    const passed = score >= 80;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {passed ? 'Congratulations!' : 'Quiz Completed'}
            </h2>
            
            <div className="mb-6">
              <div className="text-6xl font-bold text-gray-900 mb-2">{score}%</div>
              <p className="text-gray-600">
                You got {answers.reduce((acc, answer, index) => 
                  acc + (answer === currentQuiz.questions[index].correct ? 1 : 0), 0
                )} out of {currentQuiz.questions.length} questions correct
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Answer Breakdown</h3>
              <div className="space-y-2 text-sm">
                {currentQuiz.questions.map((question, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-left flex-1">Question {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      {answers[index] === question.correct ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={answers[index] === question.correct ? 'text-green-600' : 'text-red-600'}>
                        {answers[index] === question.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {passed ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Award className="w-5 h-5" />
                      <span className="font-medium">Certification Earned!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      You've successfully completed the {topic.name} certification with a score of {score}%.
                    </p>
                  </div>
                  <button
                    onClick={downloadCertificate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Certificate</span>
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    You need at least 80% to earn certification. Keep studying and try again!
                  </p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={retryQuiz}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Retry Quiz</span>
                </button>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Back to Topics
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {showCertificate && <Certificate />}
      </div>
    );
  }

  const topic = topics.find(t => t.id === selectedTopic);
  const question = currentQuiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{topic.name} Quiz</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {currentQuiz.questions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(((currentQuestion + 1) / currentQuiz.questions.length) * 100)}%
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
              {question.question}
            </h2>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
              <input
                type="radio"
                      name="answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => handleAnswerSelect(index)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
            </label>
          ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setSelectedTopic(null)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              ← Back to Topics
            </button>
            
            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === ''}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedAnswer !== ''
                  ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentQuestion === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
          </div>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot userRole="nurse" />
    </div>
  );
};

export default Quiz;