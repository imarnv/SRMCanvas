import axios from "axios";

const API_BASE_URL = "https://srmcanvas.onrender.com"; // backend port

export async function fetchAcademiaData(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/scrape`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
