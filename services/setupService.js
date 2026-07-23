const API_URL = process.env.EXPO_PUBLIC_API_URL;

// get the checslist 
export async function getChecksByEvent(eventId) {
  const response = await fetch(`${API_URL}/api/setup/checks/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch setup checks');
  }
  return await response.json();
}

// save and update checklist
export async function setCheckItem({ eventId, roomName, itemKey, isChecked, userId }) {
  const response = await fetch(`${API_URL}/api/setup/set_check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId,
      room_name: roomName,
      item_key: itemKey,
      is_checked: isChecked,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to set check item');
  }
  return await response.json();
}

// get comments
export async function getCommentsByEvent(eventId) {
  const response = await fetch(`${API_URL}/api/setup/comments/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch setup comments');
  }
  return await response.json();
}

// Save and update comments
export async function saveSetupComment({ eventId, roomName, comment, userId }) {
  const response = await fetch(`${API_URL}/api/setup/save_comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId,
      room_name: roomName,
      comment: comment,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save comment');
  }
  return await response.json();
}