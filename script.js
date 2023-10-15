const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchform]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorClass = document.querySelector(".error-box")

// initially  variable need ???

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage();

//ek kaam or pending hai

function switchTab(newTab){
   if(newTab != oldTab){
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    if(!searchForm.classList.contains("active")){
        //kya search form wala container is invisible, if yes then make it visible
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");  
    }
    else{
        // main phele search wale tab pr tha , ab your weather wale tab visible krna h
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        // ab main your weather tab me aagya hu, tohweather bhi display krna pdega, so let check local storage first for coordinates, of we haved saved them there.
        getfromSessionStorage();
    }
   }
}

userTab.addEventListener("click",()=>{
    // pass clicked tab as input parameter
    switchTab(userTab);

});

searchTab.addEventListener("click",()=>{
    // pass clicked tab as input parameter
    switchTab(searchTab);

});

//check if coodinate are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agr local coordinate nhi h
        grantAccessContainer.classList.add("active");
    }
    else{
        //here also we are puttinga try catch system
        try {
            const coordinates =JSON.parse(localCoordinates);
            fetchUserWeatherInfo(coordinates);
            
        } catch (error) {
            console.log("Session storage Error");
            //.............EXPERIMENT FOR ERROR DETECTION
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorClass.classList.add("active");
        }
    }
}

async function fetchUserWeatherInfo(coordinates){
    const{lat, lon}= coordinates;
    // make   grant continer invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");
    errorClass.classList.remove("active");

    // API call 
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );
            // Ek condition idr bhi lgyi h so that error handle kr ske
        if(response.ok){
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            //ye wala function user info container se lat long ka data lekr usko render krege mtlb show krgea
            renderWeatherInfo(data);
        }
        else{
            // errorShowingDevice();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorClass.classList.add("active");
            // errorMsg.innerText = `Error (${response.status}): ${response.statusText}`;
        }
        
    }   
     catch (error) {
        console.log("fetchSearchWeatherInfo coordinate error");
        //.............EXPERIMENT FOR ERROR DETECTION
        // errorShowingDevice();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        errorClass.classList.add("active");

    }
}

function renderWeatherInfo(weatherInfo){
    // firstly, we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudness]");

    console.log(weatherInfo);                                            // Ye badme phir se uncomment krna hoga

    // fetch value form weather INFO object and pull its UI element
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`; 
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/sec`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText =`${weatherInfo?.clouds?.all} %` ;
    // errorMsg.innerText = weatherInfo?.cod;
      
}




function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //HW - Show an elert for no geoLocation support available
      //.............EXPERIMENT FOR ERROR DETECTION
      console.log("GeoLocation Support error");
      errorShowingDevice();   
    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude, 
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName ==="")
        return;
    else
        fetchSearchWeatherInfo(cityName);

})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    errorClass.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        ); 
        // One Change has been done here for error handling by putting conditioning statement
        if(response.ok){
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
            console.log(`NO ERROR: ${response.status} - ${response.statusText}`);
        }
        else{
            //.............EXPERIMENT FOR ERROR DETECTION
            errorShowingDevice();
        }

        
    } catch (err) {
        //err
        //.............EXPERIMENT FOR ERROR DETECTION
        console.log("fetchUserWeatherInfo coordinate error");
        errorShowingDevice(); 
       
    }
}
//Error Handling Function
function errorShowingDevice(){
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    errorClass.classList.add("active");
}