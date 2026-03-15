import axios from 'axios';

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

const apiClient = axios.create({
  baseURL: NASA_API_URL,
  timeout: 15000
});

const toIsoDate = (date) => date.toISOString().split('T')[0];

export async function fetchAsteroidsByRange(daysAhead) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + daysAhead);

  const { data } = await apiClient.get('', {
    params: {
      start_date: toIsoDate(startDate),
      end_date: toIsoDate(endDate),
      api_key: API_KEY
    }
  });

  return data;
}
