const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function saveDinnerService(payload) {
  try {
    const response = await fetch(`${API_URL}/api/dinner/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Erro in saveDinnerService:', error);
    throw error;
  }
};


export async function getDinnerByIdService(dinnerId) {
  try {
    const response = await fetch(`${API_URL}/api/dinner/${dinnerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Error to find the dinner id: ${dinnerId}:`, error);
    throw error;
  }
};

// assign table to waiters
export async function fetchAssignedTables(eventId, userId) {
  try {
    const response = await fetch(`${API_URL}/api/dinner/getEvent/${eventId}/assigned/${userId}`);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro get tables:', error);
    throw error;
  }
}

// save any change on the menu orders
export async function syncOrderData(tableId, itemId, action, data = {}) {
  try {
    if (action === 'ADD_ITEM') {
      // POST
      await fetch(`${API_URL}/api/dinner/orderItems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dinnerTableId: tableId,
          guestIndex: data.guestIndex || 1, // seats numbers
          courseType: data.courseType,     // "STARTER", "MAIN", "DESSERT"
          menuItemId: itemId,
          notes: data.notes || null,
          status: 'PENDING',
        }),
      });
    }

    else if (action === 'REMOVE_ITEM') {
      // to delete the order in dinner_order_items
      await fetch(`${API_URL}/api/dinner/orderItems?tableId=${tableId}&menuItemId=${itemId}`, {
        method: 'DELETE',
      });
    }

    else if (action === 'UPDATE_NOTES') {
      // to update only the notes 
      await fetch(`${API_URL}/api/dinner/orderItems`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableId,
          menuItemId: itemId,
          notes: data.notes,
        }),
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};