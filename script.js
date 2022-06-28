"use strict";

const countriesContainer = document.querySelector(".countries");
const weatherContainer = document.querySelector(".weather");
const searchInput = document.querySelector(".search__input");
const btnLocale = document.querySelector(".btn__locale");
const btnCountry = document.querySelector(".btn__country");
const formInput = document.querySelector(".input__form");
const searchBtn = document.querySelector(".btn__search");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".btn__close-modal");
const modalMsg = document.querySelector(".modal__msg");

// Render Weather

const renderWeather = (data, className = "") => {
  weatherContainer.innerHTML = "";

  const getCountryDate = new Date(data.dt * 1000);

  const language = data.sys.country.toLowerCase();
  const country = data.sys.country.toUpperCase();
  const lanCountry = `${language}-${country}`;

  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const date = getCountryDate.toLocaleString(lanCountry, dateOptions);
  const time = getCountryDate.toLocaleString(lanCountry, timeOptions);

  const html = `<article class="card ${className}">
     <h1 class="weather__name">${data.name}</h1>
     <div class='weather__header'>
        <h1 class="weather__temp">${(
          data.main.temp - 272.15
        ).toFixed()}°C</h1></div>
        <p class=>${date}</p>
        <h2>${time}</h2>
        <img class="weather__img" src='http://openweathermap.org/img/wn/${
          data.weather[0].icon
        }@2x.png'/>
        <p class="weather__description"><span></span>${data.weather[0].description.toUpperCase()}</p>
        <div class="country__data">
        <p class="temp temp__low"><span><i class="fas fa-thermometer-empty"></i></span>${(
          data.main.temp_min - 272.15
        ).toFixed()}°C </p>
        <p class="temp temp__high"><span><i class="fas fa-thermometer-full"></i></span>${(
          data.main.temp_max - 272.15
        ).toFixed()}°C</p>
        <button class="btn btn__country ">Country Info <i class="fas fa-chevron-down country__chevron "></i></button>
      </div>
   </article>`;
  weatherContainer.insertAdjacentHTML("beforeend", html);
  weatherContainer.style.opacity = 1;
};

///Render Country
const renderCountry = function (countryData, className = "") {
  countriesContainer.innerHTML = "";
  const html = `
  <article class="card ${className}">
    <img class="country__img" src='${countryData.flags.png}' />
    <div class="country__data">
      <h3 class="country__name">${countryData.name.common}</h3>
      <h4 class="country__region">${countryData.region}</h4>
      <div class="country__info">
       <p class="country__row"><span><i class="fas fa-users"></i>${(
         countryData.population / 1000000
       ).toFixed(1)} mil </span></p>
       <p class="country__row"><span><i class="fas fa-landmark"></i>${
         countryData.capital
       }
       </span></p>
       <p class="country__row"><span><i class="fas fa-map-marker-alt"></i><a href='${
         countryData.maps.googleMaps
       } ' target= 'blank'>Map</a></span></p>
      </div>
    </div>
  </article>`;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = 1;
};
/// Get geolocation weather
const getLocaleWeather = () => {
  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function (position) {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;

      const getWeather = async () => {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8b0cf41f487184c0452201c7f7d3f0ef`
          );
          const data = await res.json();
          renderWeather(data);

          let code = data.sys.country;

          getCountry(code);
        } catch (err) {
          openModal(err);
        }
      };
      getWeather(),
        function () {
          openModal("Could not get your position");
        };
    });
};

/// Get weather by  city search

const getWeatherBySearch = () => {
  let city = searchInput.value;

  searchInput.value = "";
  const getWeather = async () => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8b0cf41f487184c0452201c7f7d3f0ef`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          openModal(`${data.message}! Please enter a correct city name!`)
        );
      }

      renderWeather(data);

      let code = data.sys.country;
      getCountry(code);
    } catch (err) {
      openModal(`Please enter a city name! ${err.cod.message}`);
    }
  };
  getWeather();
};

///Get country information
const getCountry = async (code) => {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${code}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(openModal(`${data.message} `));
    }
    let countryCode = Object.values(data).find((obj) => {
      return obj.cca2 == code;
    });
    const countryData = countryCode;
    renderCountry(countryData);
  } catch (err) {
    openModal(` ${err.message} Country not found! Please enter a city name...`);
  }
};

////Modal window
const openModal = (msg) => {
  modalMsg.innerText = msg;
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeModal = () => {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

///Search button event
searchBtn.addEventListener("click", getWeatherBySearch);
formInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    getWeatherBySearch();
  }
});

///Locale button event
btnLocale.addEventListener("click", getLocaleWeather);

///Country button event

weatherContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn__country")) {
    e.target.firstElementChild.classList.toggle("active");
    countriesContainer.classList.toggle("active");
  }
});

///Modal events
btnCloseModal.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
