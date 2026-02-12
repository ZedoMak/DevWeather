// API Configuration
const API_KEY = 'b1b15e88fa797225412429c1c50c122a1'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContent = document.getElementById('weatherContent');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const recentList = document.getElementById('recentList');

// Weather display elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feelsLike');
const weatherEmoji = document.getElementById('weatherEmoji');
const weatherDesc = document.getElementById('weatherDesc');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const devSuggestion = document.getElementById('devSuggestion');

// State
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

// Initialize
displayRecentCities();
updateDateTime();

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Handle search
async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) return;
    
    await fetchWeatherData(city);
    addToRecent(city);
    searchInput.value = '';
}

// Fetch weather data
async function fetchWeatherData(city) {
    // Show loading, hide content and error
    loading.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    error.classList.add('hidden');
    
    try {
        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'City not found' : 'Weather service error');
        }
        
        const data = await response.json();
        displayWeatherData(data);
        
    } catch (err) {
        showError(err.message);
    } finally {
        loading.classList.add('hidden');
    }
}

// Display weather data
function displayWeatherData(data) {
   
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
    weatherDesc.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Set weather emoji based on condition
    weatherEmoji.textContent = getWeatherEmoji(data.weather[0].id);
    
    // Generate developer suggestion based on weather
    devSuggestion.textContent = generateDevSuggestion(data);
    
    // Show weather content
    weatherContent.classList.remove('hidden');
}

// Get appropriate emoji for weather condition
function getWeatherEmoji(conditionCode) {
    if (conditionCode >= 200 && conditionCode < 300) return '⛈️'; // Thunderstorm
    if (conditionCode >= 300 && conditionCode < 400) return '🌧️'; // Drizzle
    if (conditionCode >= 500 && conditionCode < 600) return '🌧️'; // Rain
    if (conditionCode >= 600 && conditionCode < 700) return '❄️'; // Snow
    if (conditionCode >= 700 && conditionCode < 800) return '🌫️'; // Atmosphere (fog, etc)
    if (conditionCode === 800) return '☀️'; // Clear
    if (conditionCode > 800) return '☁️'; // Clouds
    return '🌡️'; // Default
}

// Generate developer-specific suggestions
function generateDevSuggestion(data) {
    const temp = data.main.temp;
    const weather = data.weather[0].main.toLowerCase();
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    
    if (temp > 30) {
        return "🔥 Too hot for complex algorithms! Focus on writing clean, simple code today. Perfect for refactoring!";
    } else if (temp < 10) {
        return "❄️ Cold weather = perfect for hot beverages and learning new frameworks. Try something experimental!";
    } else if (weather.includes('rain')) {
        return "☔ Rainy day? Great for debugging! Rain washes away bugs (metaphorically). Check your error logs!";
    } else if (weather.includes('cloud')) {
        return "☁️ Cloudy skies, perfect for cloud computing studies! Deploy something to AWS/Azure/GCP today.";
    } else if (weather.includes('clear') && temp > 20 && temp < 25) {
        return "✨ Perfect weather! Ideal for starting that big refactoring project you've been planning.";
    } else if (humidity > 80) {
        return "💧 High humidity means stay indoors. Great day for learning Docker or Kubernetes!";
    } else if (wind > 10) {
        return "🌪️ Windy outside = agile development. Quick iterations and fast feedback loops today!";
    } else {
        return "💻 Balanced weather = balanced code. Perfect day for test-driven development!";
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
    weatherContent.classList.add('hidden');
}

// Add city to recent searches
function addToRecent(city) {
    // Format city name (capitalize first letter of each word)
    const formattedCity = city.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    // Remove if already exists
    recentCities = recentCities.filter(c => c.toLowerCase() !== formattedCity.toLowerCase());
    
    // Add to beginning
    recentCities.unshift(formattedCity);
    
    // Keep only last 5
    recentCities = recentCities.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    
    // Update UI
    displayRecentCities();
}

// Display recent cities
function displayRecentCities() {
    if (recentCities.length === 0) {
        recentList.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No recent searches</p>';
        return;
    }
    
    recentList.innerHTML = recentCities
        .map(city => `<span class="recent-item" onclick="fetchWeatherData('${city}')">${city}</span>`)
        .join('');
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Make fetchWeatherData available globally for recent items
window.fetchWeatherData = fetchWeatherData;

// Initial load - fetch weather for first recent city or default
if (recentCities.length > 0) {
    fetchWeatherData(recentCities[0]);
} else {
    fetchWeatherData('Addis Ababa'); // Default city
}