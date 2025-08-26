import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';

const ResumeBuilder = ({ user }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    education: '',
    certifications: '',
    projects: '',
    awards: ''
  });

  const [experiences, setExperiences] = useState([
    {
      id: 1,
      rotation: '',
      institution: '',
      skills: ''
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState('Simple');

  const templates = [
    { name: 'Simple', description: 'Clean & Professional' },
    { name: 'Modern', description: 'Contemporary Design' },
    { name: 'Bold', description: 'Stand Out Style' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExperienceChange = (id, field, value) => {
    setExperiences(prev => 
      prev.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const addExperience = () => {
    const newId = Math.max(...experiences.map(exp => exp.id)) + 1;
    setExperiences(prev => [...prev, {
      id: newId,
      rotation: '',
      institution: '',
      skills: ''
    }]);
  };

  const removeExperience = (id) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const downloadPDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Build the resume content with proper styling
    const resumeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NurseMate Resume - ${formData.firstName || 'User'} ${formData.lastName || 'Name'}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
            body {
              font-family: ${getPreviewStyle().fontFamily || 'Georgia, serif'};
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #2196F3;
            }
            .name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #333;
            }
            .contact {
              font-size: 14px;
              color: #666;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              color: #2196F3;
              font-size: 16px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #2196F3;
              padding-bottom: 5px;
            }
            .experience-item {
              margin-bottom: 15px;
            }
            .experience-title {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 3px;
            }
            .experience-institution {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
            }
            .experience-skills {
              font-size: 11px;
              margin-bottom: 5px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #2196F3;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }
            .print-button:hover {
              background: #1976D2;
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print/Save as PDF</button>
          
          <div class="header">
            <div class="name">
              ${formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : 'Your Name'}
            </div>
            <div class="contact">
              ${formData.email || formData.phone ? `${formData.email} | ${formData.phone}` : 'your.email@example.com | (555) 123-4567'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Education</div>
            <p>${formData.education || 'Your education details will appear here...'}</p>
          </div>

          <div class="section">
            <div class="section-title">Clinical Experience</div>
            ${experiences.map((exp) => `
              <div class="experience-item">
                <div class="experience-title">${exp.rotation || 'Rotation/Position'}</div>
                <div class="experience-institution">${exp.institution || 'Institution'}</div>
                <div class="experience-skills">${exp.skills || 'Skills learned...'}</div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="section-title">Certifications</div>
            <p>${formData.certifications || 'Your certifications and licenses will appear here...'}</p>
          </div>

          <div class="section">
            <div class="section-title">Projects & Awards</div>
            <p>${formData.projects || formData.awards ? `${formData.projects} ${formData.awards}` : 'Your projects and achievements will appear here...'}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(resumeContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  };

  const getPreviewStyle = () => {
    switch (selectedTemplate) {
      case 'Modern':
        return { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };
      case 'Bold':
        return { fontFamily: 'Arial, sans-serif', fontWeight: 'bold' };
      default:
        return { fontFamily: 'Georgia, serif' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Build Your <span className="text-blue-600">Medical Resume</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Create a professional medical resume with our AI-powered builder. Perfect for medical students, residents, and healthcare professionals.
          </motion.p>
        </div>

        {/* Builder Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Form Section */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Profile Details */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  👤
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="Medical School, Degree, Year of Graduation"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  placeholder="List your medical certifications and licenses"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
                />
              </div>
            </div>

            {/* Clinical Experience */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  🏥
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Clinical Experience</h2>
              </div>

              {experiences.map((experience) => (
                <div key={experience.id} className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rotation/Position</label>
                      <input
                        type="text"
                        value={experience.rotation}
                        onChange={(e) => handleExperienceChange(experience.id, 'rotation', e.target.value)}
                        placeholder="Internal Medicine Rotation"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        value={experience.institution}
                        onChange={(e) => handleExperienceChange(experience.id, 'institution', e.target.value)}
                        placeholder="General Hospital"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills Learned</label>
                    <textarea
                      value={experience.skills}
                      onChange={(e) => handleExperienceChange(experience.id, 'skills', e.target.value)}
                      placeholder="Patient assessment, diagnostic procedures, treatment planning..."
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
                    />
                  </div>
                  {experiences.length > 1 && (
                    <button
                      onClick={() => removeExperience(experience.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addExperience}
                className="w-full p-4 border-2 border-dashed border-blue-500 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors"
              >
                + Add Another Clinical Experience
              </button>
            </div>

            {/* Projects & Awards */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  🏆
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Projects & Awards</h2>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Projects & Research</label>
                <textarea
                  name="projects"
                  value={formData.projects}
                  onChange={handleInputChange}
                  placeholder="Research projects, publications, presentations..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Awards & Honors</label>
                <textarea
                  name="awards"
                  value={formData.awards}
                  onChange={handleInputChange}
                  placeholder="Academic honors, scholarships, recognition..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
                />
              </div>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                👁️
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Resume Preview</h2>
            </div>

            {/* Template Selection */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => setSelectedTemplate(template.name)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    selectedTemplate === template.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                </button>
              ))}
            </div>

            {/* Resume Preview */}
            <div 
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[500px] resume-preview"
              style={getPreviewStyle()}
            >
              <div className="text-center mb-6 pb-4 border-b-2 border-blue-500">
                <div className="text-xl font-bold mb-2">
                  {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : 'Your Name'}
                </div>
                <div className="text-sm text-gray-600">
                  {formData.email || formData.phone ? `${formData.email} | ${formData.phone}` : 'your.email@example.com | (555) 123-4567'}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">Education</h3>
                <p className="text-sm">
                  {formData.education || 'Your education details will appear here...'}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">Clinical Experience</h3>
                {experiences.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="font-medium text-sm">{exp.rotation || 'Rotation/Position'}</div>
                    <div className="text-sm text-gray-600">{exp.institution || 'Institution'}</div>
                    <div className="text-sm mt-1">{exp.skills || 'Skills learned...'}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">Certifications</h3>
                <p className="text-sm">
                  {formData.certifications || 'Your certifications and licenses will appear here...'}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">Projects & Awards</h3>
                <p className="text-sm">
                  {formData.projects || formData.awards ? `${formData.projects} ${formData.awards}` : 'Your projects and achievements will appear here...'}
                </p>
              </div>
            </div>

            <button
              onClick={downloadPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors mt-4"
            >
              📄 Export as PDF
            </button>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Medical Career?</h2>
          <p className="text-xl opacity-90">
            Join thousands of medical professionals who trust NurseMate for their career development
          </p>
        </motion.div>
      </div>
      
      {/* Chatbot */}
      <Chatbot userRole="nurse" />
    </div>
  );
};

export default ResumeBuilder; 