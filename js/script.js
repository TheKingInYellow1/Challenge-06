const APIkey = '8c98e9bbeee9b8bdb11ced21bed834e7';

let searchHistory = [];
if (localStorage.getItem('localSearchHistory') !== null) {
   searchHistory = JSON.parse(localStorage.getItem('localSearchHistory'));
   recentSearches();
}

function saveHistory(cityName, stateCode, lat, lon) {
   let searchInput = [cityName, stateCode, lat, lon];
   for (let i = 0; i < searchHistory.length; i++) {
      if (searchInput[0] === searchHistory[i][0] && searchInput[1] === searchHistory[i][1]) return;
   }
   if (searchHistory.length > 4) searchHistory.shift();
   searchHistory.push(searchInput);
   recentSearches();
   localStorage.setItem('localSearchHistory', JSON.stringify(searchHistory));
}

function recentSearches() {
   const historyList = document.querySelector('#historyList');
   while (historyList.firstChild) {
      historyList.removeChild(historyList.firstChild);
   }
   for (let i = 0; i < searchHistory.length; i++) {
      const recent = document.createElement('li');
      recent.textContent = `${searchHistory[i][0]}, ${searchHistory[i][1]}`;
      recent.addEventListener('click', function() {
         getWeather(searchHistory[i][2], searchHistory[i][3]);
      });
      historyList.appendChild(recent);
   }
}

function getWeather(lat, lon) {
   const APIforecast = `https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=${lat}&lon=${lon}&appid=${APIkey}`;
   fetch(APIforecast)
      .then(function (response) {
         if (!response.ok) {
            throw new Error('Network response was not ok');
         }
         return response.json();
      })
      .then(function (data) {
         for (let i = 0; i < 6; i++) {
            const day = document.querySelector(`#day${i}`);
            const dayCity = day.querySelector('.city');
            const dayWeather = day.querySelector('.weather');
            const dayTemp = day.querySelector('.temp');
            const dayWind = day.querySelector('.wind');
            const dayHumidity = day.querySelector('.humidity');

            let i2 = 0;
            if (i !== 0) i2 = i * 8 - 1;
            const dateCurrent = (new Date(`${data.list[i2].dt_txt} GMT+0000`)).toString().split('GMT')[0];

            dayCity.innerHTML = `${data.city.name} ${dateCurrent} <img src="">`;
            const dayImg = day.querySelector('img');

            dayImg.src = `WeatherIcons/${data.list[i2].weather[0].icon}.png`;
            dayWeather.textContent = `Weather: ${data.list[i2].weather[0].description}`
            dayTemp.textContent = `Temperature: ${data.list[i2].main.temp} °F`;
            dayWind.textContent = `Wind Speed: ${data.list[i2].wind.speed} mph`;
            dayHumidity.textContent = `Humidity: ${data.list[i2].main.humidity}%`;
         }
      })
      .catch(function (error) {
         console.error(error);
      });
}

function getLocation() {
   const cityName = document.querySelector('#cityInput').value.trim();
   if (!cityName) return;
   const stateCode = document.querySelector('#stateInput').value;
   if (!stateCode) return;
   const countryCode = 'US';
   const APIgeo = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&appid=${APIkey}`;
   fetch(APIgeo)
      .then(function (response) {
         if (!response.ok) {
            throw new Error('Network response was not ok');
         }
         return response.json();
      })
      .then(function (data) {
         const lat = data[0].lat;
         const lon = data[0].lon;
         getWeather(lat, lon);
         saveHistory(cityName, stateCode, lat, lon);
      })
      .catch(function (error) {
         console.error(error);
      });
}