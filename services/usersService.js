const API_URL = process.env.EXPO_PUBLIC_API_URL;

// get all users 
export async function getUsersStaff(){
  const response = await fetch(`${API_URL}/api/users/staff`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return await response.json();
};