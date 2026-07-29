const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Get drink tracking items for a specific event
export async function getTrackedItemsByEvent(eventId) {
  const response = await fetch(`${API_URL}/api/drinkTracking/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch drink tracking items');
  }
  return await response.json();
}

// Save and add a tracked beverage item to the event
export async function addTrackedItem({ eventId, beverageId, quantity, unitPrice, addedBy }) {
    const response = await fetch(`${API_URL}/api/drinkTracking/${eventId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      beverageId: Number(beverageId),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      addedBy: Number(addedBy),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add tracked drink item');
  }

  return await response.json();
}

// Get the full beverages catalog for the modal selection
export async function getBeveragesCatalog() {
  const response = await fetch(`${API_URL}/api/drinkTracking/beverages`);
  if (!response.ok) {
    throw new Error('Failed to fetch beverages catalog');
  }
  return await response.json();
}

export const updateTrackedItem = async (eventId, beverageId,userId, quantity) => {
  try {
    const response = await fetch(`${API_URL}/api/drinkTracking/${eventId}/beverageItem/${beverageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quantity,
        userId
      }),
    });

    if (!response.ok) {
      throw new Error('Update error.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateTrackedItem:', error);
    throw error;
  }
};

export const deleteTrackedItem = async (eventId, beverageId) => {
  try {
    const response = await fetch(`${API_URL}/api/drinkTracking/${eventId}/beverageItem/${beverageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Delete Error.',response );
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteTrackedItem:', error);
    throw error;
  }
};