export const STATUS_CONFIG = {
  in_progress: {
    value: 'in_progress',
    label: 'In Progress',
    badgeBg: '#E3F5E1',
    badgeText: '#2E9E4F',
  },
  upcoming: {
    value: 'upcoming',
    label: 'Upcoming',
    badgeBg: '#FDEEE0',
    badgeText: '#E28A3D',
  },
  drink_reception: {
    value: 'drink_reception',
    label: 'Drink Reception',
    badgeBg: '#E3EAFD',
    badgeText: '#3D5CFF',
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    badgeBg: '#EAEAEA',
    badgeText: '#888888',
  },
};

export function getEventStatus(event) {
  const now = new Date();
  const datePart = event.event_date.split('T')[0]; // "2026-07-16"

  const start = new Date(`${datePart}T${event.start_time}`);
  const end = new Date(`${datePart}T${event.end_time}`);
  
  if (now >= start && now <= end) return STATUS_CONFIG.in_progress
  if (now < start) return STATUS_CONFIG.upcoming;
  return STATUS_CONFIG.completed;
}