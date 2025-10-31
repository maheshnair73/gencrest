import React, { useState } from 'react';
import { Plus, Target, Clock, CheckCircle, AlertTriangle, X, Camera, FileText, User, Calendar, Save } from 'lucide-react';
import { Task, TaskVerification } from '../types';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Visit' | 'Sales' | 'Liquidation' | 'Collection' | 'Training' | 'Documentation';
  estimatedDuration: number;
  priority: 'High' | 'Medium' | 'Low';
  verificationRequired: boolean;
}

interface TaskManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'verify';
  assigneeType: 'self' | 'mdo';
  assigneeName?: string;
  existingTasks?: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
  onTasksVerified?: (verifications: TaskVerification[]) => void;
  userRole: string;
  userName: string;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'T001',
    name: 'Stock Verification',
    description: 'Verify physical stock against system records',
    category: 'Visit',
    estimatedDuration: 30,
    priority: 'High',
    verificationRequired: true
  },
  {
    id: 'T002',
    name: 'Liquidation Review',
    description: 'Review liquidation progress and farmer sales',
    category: 'Liquidation',
    estimatedDuration: 20,
    priority: 'High',
    verificationRequired: true
  },
  {
    id: 'T003',
    name: 'Customer Feedback Collection',
    description: 'Collect customer satisfaction feedback',
    category: 'Visit',
    estimatedDuration: 15,
    priority: 'Medium',
    verificationRequired: false
  },
  {
    id: 'T004',
    name: 'Payment Collection',
    description: 'Collect outstanding payments from customer',
    category: 'Collection',
    estimatedDuration: 25,
    priority: 'High',
    verificationRequired: true
  },
  {
    id: 'T005',
    name: 'Product Demonstration',
    description: 'Demonstrate new product features and benefits',
    category: 'Sales',
    estimatedDuration: 45,
    priority: 'Medium',
    verificationRequired: false
  },
  {
    id: 'T006',
    name: 'Retailer Training',
    description: 'Conduct product knowledge training for retailers',
    category: 'Training',
    estimatedDuration: 60,
    priority: 'Medium',
    verificationRequired: true
  },
  {
    id: 'T007',
    name: 'Competitor Analysis',
    description: 'Analyze competitor presence and pricing',
    category: 'Visit',
    estimatedDuration: 20,
    priority: 'Low',
    verificationRequired: false
  },
  {
    id: 'T008',
    name: 'Order Processing',
    description: 'Process new orders and confirm delivery dates',
    category: 'Sales',
    estimatedDuration: 30,
    priority: 'High',
    verificationRequired: true
  },
  {
    id: 'T009',
    name: 'Documentation Update',
    description: 'Update customer records and visit reports',
    category: 'Documentation',
    estimatedDuration: 15,
    priority: 'Low',
    verificationRequired: false
  },
  {
    id: 'T010',
    name: 'Credit Review',
    description: 'Review customer credit status and limits',
    category: 'Collection',
    estimatedDuration: 20,
    priority: 'Medium',
    verificationRequired: true
  }
];

export const TaskManager: React.FC<TaskManagerProps> = ({
  isOpen,
  onClose,
  mode,
  assigneeType,
  assigneeName,
  existingTasks = [],
  onTasksUpdate,
  onTasksVerified,
  userRole,
  userName
}) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customTask, setCustomTask] = useState({
    name: '',
    description: '',
    priority: 'Medium' as const,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    verificationRequired: false
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [taskVerifications, setTaskVerifications] = useState<Record<string, TaskVerification>>({});

  if (!isOpen) return null;

  const handleTaskToggle = (templateId: string) => {
    setSelectedTasks(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleCreateTasks = () => {
    const newTasks: Task[] = [];

    // Add selected template tasks
    selectedTasks.forEach(templateId => {
      const template = TASK_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        newTasks.push({
          id: `task_${Date.now()}_${templateId}`,
          templateId,
          name: template.name,
          description: template.description,
          assignedTo: assigneeType === 'self' ? userName : assigneeName || '',
          assignedBy: userName,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Pending',
          priority: template.priority,
          category: 'Standard',
          verificationRequired: template.verificationRequired
        });
      }
    });

    // Add custom task if provided
    if (showCustomForm && customTask.name.trim()) {
      newTasks.push({
        id: `task_${Date.now()}_custom`,
        name: customTask.name,
        description: customTask.description,
        assignedTo: assigneeType === 'self' ? userName : assigneeName || '',
        assignedBy: userName,
        dueDate: customTask.dueDate,
        status: 'Pending',
        priority: customTask.priority,
        category: 'Custom',
        verificationRequired: customTask.verificationRequired
      });
    }

    onTasksUpdate([...existingTasks, ...newTasks]);
    
    // Reset form
    setSelectedTasks([]);
    setCustomTask({
      name: '',
      description: '',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verificationRequired: false
    });
    setShowCustomForm(false);
    onClose();
  };

  const handleTaskVerification = (taskId: string, verification: Partial<TaskVerification>) => {
    setTaskVerifications(prev => ({
      ...prev,
      [taskId]: {
        taskId,
        status: verification.status || 'Not Started',
        completionPercentage: verification.completionPercentage || 0,
        notes: verification.notes || '',
        evidence: verification.evidence || [],
        verifiedBy: userName,
        verifiedAt: new Date().toISOString(),
        nextAction: verification.nextAction
      }
    }));
  };

  const handleVerifyTasks = () => {
    const verifications = Object.values(taskVerifications);
    if (onTasksVerified) {
      onTasksVerified(verifications);
    }
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Partially Completed': return 'bg-yellow-100 text-yellow-800';
      case 'Not Started': return 'bg-red-100 text-red-800';
      case 'Skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Visit': return 'bg-blue-100 text-blue-800';
      case 'Sales': return 'bg-green-100 text-green-800';
      case 'Liquidation': return 'bg-purple-100 text-purple-800';
      case 'Collection': return 'bg-orange-100 text-orange-800';
      case 'Training': return 'bg-indigo-100 text-indigo-800';
      case 'Documentation': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (mode === 'create') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Create Tasks {assigneeType === 'self' ? 'for Self' : `for ${assigneeName}`}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Select from common tasks or create custom tasks
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Common Tasks */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Common Tasks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TASK_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTasks.includes(template.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handleTaskToggle(template.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{template.name}</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                          {template.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.estimatedDuration} min</span>
                      {template.verificationRequired && (
                        <span className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verification Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Task */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Custom Task</h4>
                <button
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </button>
              </div>

              {showCustomForm && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                      <input
                        type="text"
                        value={customTask.name}
                        onChange={(e) => setCustomTask(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter task name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={customTask.dueDate}
                        onChange={(e) => setCustomTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={customTask.description}
                      onChange={(e) => setCustomTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter task description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={customTask.priority}
                        onChange={(e) => setCustomTask(prev => ({ ...prev, priority: e.target.value as 'High' | 'Medium' | 'Low' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customTask.verificationRequired}
                          onChange={(e) => setCustomTask(prev => ({ ...prev, verificationRequired: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Requires Verification</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedTasks.length} template task(s) + {showCustomForm && customTask.name ? 1 : 0} custom task selected
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTasks}
                  disabled={selectedTasks.length === 0 && (!showCustomForm || !customTask.name.trim())}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verification Mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Verify Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verify completion of assigned tasks before ending meeting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {existingTasks.map(task => {
              const verification = taskVerifications[task.id] || {
                taskId: task.id,
                status: 'Not Started',
                completionPercentage: 0,
                notes: '',
                evidence: [],
                verifiedBy: userName,
                verifiedAt: new Date().toISOString()
              };

              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{task.name}</h4>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={verification.status}
                        onChange={(e) => handleTaskVerification(task.id, { 
                          ...verification, 
                          status: e.target.value as TaskVerification['status']
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Partially Completed">Partially Completed</option>
                        <option value="Completed">Completed</option>
                        <option value="Skipped">Skipped</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Completion %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={verification.completionPercentage}
                        onChange={(e) => handleTaskVerification(task.id, { 
                          ...verification, 
                          completionPercentage: Number(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={verification.notes}
                      onChange={(e) => handleTaskVerification(task.id, { 
                        ...verification, 
                        notes: e.target.value
                      })}
                      placeholder="Add verification notes..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {task.verificationRequired && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">Verification Required</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        This task requires evidence or documentation for completion
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyTasks}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};