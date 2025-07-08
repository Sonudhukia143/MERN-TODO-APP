import axios from 'axios';

const api = axios.create({
    baseURL: 'https://to-do-task-manager.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;