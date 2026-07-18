import { getEventStatus } from './eventStatus';

export function formatDateTitle(dateKey) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateKey));
}

function groupEventsByDate(eventsList) {
  const groups = {};

  eventsList.forEach((event) => {
    const dateKey = event.event_date;

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
  });

  // Turns the { "2026-05-07": [...] } object into a sorted array of sections
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(a) - new Date(b));

  return sortedDates.map((dateKey) => ({
    date: dateKey,
    title: formatDateTitle(dateKey),
    data: groups[dateKey],
  }));
}

/**
 * Filters events by text search + quick filter dates and status tab
 *
 * @param {Array} events - full unfiltered events list
 * @param {string} searchQuery - free text typed by the user
 * @param {string} selectedFilter - 'All' and a specific date string
 * @param {string} [statusFilter] - 'all' | 'upcoming' | 'in_progress' | 'completed'
 * @returns {Array} sections shaped as { date, title, data }
 */
export function filterAndGroupEvents(events, searchQuery, selectedFilter, statusFilter = 'all') {
  let filtered = events;

  // Text search filter matching by event title
  if (searchQuery.trim() !== '') {
    filtered = filtered.filter((event) =>
      event.account_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Quick filter tabs 
  if (selectedFilter === 'Tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toISOString().split('T')[0];

    filtered = filtered.filter((event) => event.event_date === tomorrowKey);
  } else if (selectedFilter !== 'All') {
    filtered = filtered.filter((event) => event.event_date === selectedFilter);
  }

  // Status filter (Upcoming / In Progress / Completed)
  if (statusFilter !== 'all') {
    filtered = filtered.filter((event) => getEventStatus(event).value === statusFilter);
  }

  return groupEventsByDate(filtered);
}