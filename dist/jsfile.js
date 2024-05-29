const main = document.getElementById("main")
const searchBtn = document.getElementById("searchbtn");
const currentBtn = document.getElementById("currentbtn");
const inputBox = document.getElementById("inputbox");
const weatherCard = document.getElementById("Weathercard");
const recentContainer = document.getElementById("recent-container");
const recentList = document.getElementById("recent-list");
const API_key = "1c2fa74571cdbea91a79dd19cd703d41";

const createWeathercard = (weatheritem) => {
    return `<li class="bg-slate-700 text-white p-4 list-none rounded-md mb-3 sm:mb-3 lg:mb-3">
        <h2>(${weatheritem.dt_txt.split(" ")[0]})</h2>
        <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" class="w-20 ">
        <h4>Temperature: ${weatheritem.main.temp} °C</h4>
        <h4>Wind: ${weatheritem.wind.speed} m/s</h4>
        <h4>Humidity: ${weatheritem.main.humidity}%</h4>
    </li>`;
}

const displayWeather = (data, city) => {
    const weatherContainer = document.getElementById("currentweather");

    if (!weatherContainer) {
        console.error("Weather container not found");
        return;
    }

    const weatherCity = weatherContainer.querySelector("#weather-city");
    const weatherTemp = weatherContainer.querySelector("#weather-temp");
    const weatherWind = weatherContainer.querySelector("#weather-wind");
    const weatherHumidity = weatherContainer.querySelector("#weather-humidity");
    const weatherIcon = weatherContainer.querySelector("#weather-icon");
    const weatherDescription = weatherContainer.querySelector("#weather-description");

    if (weatherCity) weatherCity.innerText = city;
    if (weatherTemp) weatherTemp.innerText = `Temperature: ${data.list[0].main.temp} °C`;
    if (weatherWind) weatherWind.innerText = `Wind: ${data.list[0].wind.speed} m/s`;
    if (weatherHumidity) weatherHumidity.innerText = `Humidity: ${data.list[0].main.humidity}%`;
    if (weatherIcon) weatherIcon.src = `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@4x.png`;
    if (weatherDescription) weatherDescription.innerText = data.list[0].weather[0].description;

    const uniqueForecast = [];
    const fiveDaysForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecast.includes(forecastDate) && uniqueForecast.length < 5) {
            uniqueForecast.push(forecastDate);
            return true;
        }
        return false;
    });

    weatherCard.innerHTML = '';
    fiveDaysForecast.forEach(weatheritem => {
        weatherCard.innerHTML += createWeathercard(weatheritem);
    });
    hiddendiv();

}
const hiddendiv = () => {
    main.style.display = "block";
}

const getWeatherDetails = (city, lat, lon) => {
    const getWeather_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`;
    fetch(getWeather_API)
        .then(res => res.json())
        .then(data => displayWeather(data, city))
        .catch(err => {
            console.error("Error fetching weather data:", err);
            alert("An error occurred while fetching the weather forecast.");
        });
}

const getCityCoordinates = () => {
    const cityname = inputBox.value.trim();
    if (!cityname) return alert("please Enter City Name");
    const geocoding_API = `https://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=5&appid=${API_key}`;
    fetch(geocoding_API)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityname}`);
            const { name, lat, lon } = data[0];
            saveRecentCity(name);
            getWeatherDetails(name, lat, lon);
        })
        .catch(err => {
            console.error("Error fetching coordinates:", err);
            alert("An error occurred while fetching the coordinates.");
        });
}

const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherDetails('Current Location', latitude, longitude);
        }, err => {
            console.error("Error getting location:", err);
            alert("Unable to retrieve your location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

const saveRecentCity = (city) => {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        displayRecentCities();
    }
}

const displayRecentCities = () => {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentList.innerHTML = '';
    if (recentCities.length > 0) {
        recentContainer.style.display = 'block';
        recentCities.forEach(city => {
            const cityItem = document.createElement('li');
            cityItem.innerText = city;
            cityItem.classList.add('cursor-pointer');
            cityItem.addEventListener('click', () => {
                const geocoding_API = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_key}`;
                fetch(geocoding_API)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.length) return alert(`No coordinates found for ${city}`);
                        const { name, lat, lon } = data[0];
                        getWeatherDetails(name, lat, lon);
                    })
                    .catch(err => {
                        console.error("Error fetching coordinates:", err);
                        alert("An error occurred while fetching the coordinates.");
                    });
            });
            recentList.appendChild(cityItem);
        });
    } else {
        recentContainer.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', displayRecentCities);

searchBtn.addEventListener("click", getCityCoordinates,);
currentBtn.addEventListener("click", getCurrentLocationWeather);
