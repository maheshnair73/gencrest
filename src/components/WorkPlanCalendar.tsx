import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, MapPin, Clock } from 'lucide-react';

interface Activity {
  id: number;
  date: string;
  activity: string;
  location: string;
  time: string;
  status: string;
}

interface WorkPlanCalendarProps {
  activities: Activity[];
  onAddActivity?: (date: string) => void;
  onActivityClick?: (activity: Activity) => void;
  canCreate?: boolean;
}

const WorkPlanCalendar: React.FC<WorkPlanCalendarProps> = ({ activities, onAddActivity, onActivityClick, canCreate = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getActivitiesForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activities.filter(activity => activity.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 bg-gray-50 border border-gray-200"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayActivities = getActivitiesForDate(day);
      const today = isToday(day);

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 overflow-hidden ${
            today ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${today ? 'text-blue-600' : 'text-gray-700'}`}>
              {day}
            </span>
            {canCreate && (
              <button
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  onAddActivity?.(dateStr);
                }}
                className="p-0.5 hover:bg-blue-100 rounded"
              >
                <Plus className="w-3 h-3 text-blue-600" />
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {dayActivities.slice(0, 2).map((activity) => (
              <div
                key={activity.id}
                className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                  activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}
                title={activity.activity}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Calendar activity clicked:', activity);
                  console.log('onActivityClick function exists:', !!onActivityClick);
                  if (onActivityClick) {
                    onActivityClick(activity);
                  } else {
                    alert('Click handler not connected! Please check ActivityTracker component.');
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {activity.activity}
              </div>
            ))}
            {dayActivities.length > 2 && (
              <div className="text-xs text-gray-600 font-medium">
                +{dayActivities.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 gap-0">
            {dayNames.map((day) => (
              <div
                key={day}
                className="bg-gray-100 border-b border-gray-200 py-2 text-center text-sm font-semibold text-gray-700"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {renderCalendarDays()}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No activities planned for this month</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('List activity clicked:', activity);
                  if (onActivityClick) {
                    onActivityClick(activity);
                  } else {
                    alert('Click handler not connected in list view!');
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {activity.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{activity.activity}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {activity.location}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WorkPlanCalendar;
