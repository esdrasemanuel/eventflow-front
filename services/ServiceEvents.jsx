const API_URL = process.env.EXPO_PUBLIC_API_URL;

//Get events from the day 
export async function getEvents() {
  const response = await fetch(`${API_URL}/api/events/events_list`);
  const events = await response.json();
  events.events.sort((a, b) => a.start_time.localeCompare(b.start_time));//Order events by start_time
  
  return events;
}

//Get all events 
export async function getAllEvents() {
  const response = await fetch(`${API_URL}/api/events/all_events_list`);
  const events = await response.json();
  events.sort((a, b) => a.start_time.localeCompare(b.start_time));//Order events by start_time
  
  return events;
}
