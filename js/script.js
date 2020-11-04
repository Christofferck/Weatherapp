// JavaScript Document

//Declarering af variabler
var input = document.getElementById("input");
var searchIcon = document.getElementById("SearchIcon");
var background = document.getElementById("BackgroundBlur");
var forecastBox = document.getElementById("ForecastHour");
var plus = document.getElementById("plus");
var cityHeader = document.getElementById("By");
var manageCities = document.getElementById("ManageCities");
var cities = document.getElementById("Cities");
var manageCityBox = document.getElementById("ManageCityBox");
var optimize = document.getElementById("optimize");
var iconBox = document.getElementById("Icon");
var forecastBoxCollection = document.getElementsByClassName("Forecastbox");
var ajaxRequestCurrent = new XMLHttpRequest();
var ajaxRequestForecast = new XMLHttpRequest();
var ajaxRequestLocation = new XMLHttpRequest();
var savedCities = [];
var timeForecastArray = []
var oldSavedCities = JSON.parse(localStorage.getItem("cities"));
var date = new Date();
var hour = date.getHours();
var minutes = date.getMinutes();
//funktions kald
timeBackground(hour, minutes);
getLocation()

/*Hvis intet er gemt i localStorage skal dens array være tom, ellers skal
arrayet gemt loopes igennem og sættes på arrayet "savedCities". Derefter sendes
navnet med videre så de gemte byer bliver vist på sien*/
if (oldSavedCities == null) {
	oldSavedCities = [];
} else {
	for (i = 0; i < oldSavedCities.length; i++) {
		savedCities.push(oldSavedCities[i]);
		addToArray(oldSavedCities[i]);
	}

}

//Funktion der skal køre geolocation hvis brugeren tillader det
function getLocation () {
	if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
}

//funktion der finder enhedens postion og sender videre
function showPosition (position) {
	var lat = Math.round(position.coords.latitude, 10);
	var lon = Math.round(position.coords.longitude, 10);
	getLocationWeather(lat, lon);
}

//slide funktion til søgning
$("#addCity").click(function() {
	$("#search").slideToggle(1000);
});

//eventListener der kør ToogleUI
manageCities.addEventListener("click", toggleUI);

/* funktion der skifter imellem vejr interface, hvor man kan se vejret og
Adminster byernes interface*/
//OPTIMIZE
function toggleUI () {
	$("#optimize, #ManageCityBox").toggle();
	if (manageCities.innerHTML == "Adminster byer") {
		manageCities.innerHTML="Oversigt"
		$("#ManageCityBox").css("display","flex");
	} else {
		manageCities.innerHTML = "Adminster byer"
	}
}

/*funktion som tager et navn som paramenter alt efter hvor denne funktion bliver
kørt fra. Den laver en div med titel og en knap på alle elementer sendt hertil.
På nogle af elementerne bliver der lagt id'er og classes på.
Disse classes bliver brugt til at lave en HTML collection der sendes videre til
en anden funktion*/
function addToArray (cityName) {
		var lastID = savedCities.length -1;
		var newCity = document.createElement("div");
		var newCityHeader = document.createElement("h2");
		var namesCollection = document.getElementsByClassName("name");
		var minus = document.createElement("button");
		var minusCollection = document.getElementsByClassName("minus");
		minus.innerHTML = "-";
		minus.setAttribute("class", "minus");
		newCityHeader.setAttribute("class", "name");
		newCity.setAttribute("class", "city");
		newCity.setAttribute("id", 'City' + lastID);
		newCityHeader.innerHTML = cityName;
		newCity.appendChild(newCityHeader);
	  newCity.appendChild(minus);
	  cities.appendChild(newCity);
	  makeMinusArray (minusCollection);
		makeNameArray (namesCollection);
		getCity(input.value);
}


/*Funktionen tager en HTML kollektion fra addtoArray og laver det om til et array.
der bliver derefter brugt forEach på dette array*/
function makeMinusArray (Collection) {
  var minusArray = Array.from(Collection);
  minusArray.forEach(eventListenerMinus);
}

/*Der bliver tilføjet en eventListener til alle elementer i arrayet fra
"makeMinusArray" som skal køre "removeFromArray"*/
function eventListenerMinus (minus) {
  minus.addEventListener("click", function () {
    removeFromArray(this);
  })
}

/* Denne funktion bliver kaldt fra funktionen "eventListener". Den tager et
paramenter som er den knap man har trykket på. Ved at have den, finder den
forælderen og gemmer i en variabel samt navnet på byen. Her bruges jquery til at
slette diven der har et bestemt id. Dette bruges til at finde den præcise div og
slette den og alt indhold i den. Derefter køres et for loop, der skal loop igennem
savedCities og finde det navn der matcher med byens navn. Via splice vil dette
navn blive slettet. Til sidst bliver det nu opdateret array gemt til localStorage.*/
function removeFromArray (button) {
  var cityNode = button.parentNode;
	console.log(cityNode.id);
  var cityName = cityNode.firstChild.innerHTML;
  $('#' + cityNode.id).remove();
  for (i = 0; i < savedCities.length; i++) {
    if (savedCities[i] == cityName) {
      savedCities.splice(i, 1);
    }
  }
	localStorage.setItem("cities", JSON.stringify(savedCities));
}

/*Funktionen tager en HTML kollektion fra addtoArray og laver det om til et array.
der bliver derefter brugt forEach på dette array*/
function makeNameArray (Collection) {
	var nameArray = Array.from(Collection);
	nameArray.forEach(ShowWeather)
}

/* På hvert element fra "makeNameArray" bliver sat en eventListener. Denne tager
og kalder på to funktioner "getCity" og "ShowCity". Begge disse funktioner tager
imod et parameter, som er den titel eventListeneren er blevet sat på. Derudover
vil interfacet skifte til vejret.
For at Forecast virker korrekt bliver vi nød til at slette hvad der tideligere
var skrevet. Dette betyder at alle div'er med classen "forecastBox" vil blive
slettet inden de nye bliver lavet */
function ShowWeather (name) {
	name.addEventListener("click", function () {
		if (forecastBoxCollection.length > 0) {
			$( ".Forecastbox" ).remove();
		};
		getCity(this.innerHTML);
		showCity(this.innerHTML);
		toggleUI()

	})
}

/* En eventlistener bliver sat på søgeikonet. Hvis der bliver trykket på denne
skal funktionen "addToArray" køre samt skal navnet på byen skrevet i inputfeltet
sættes på "savedCities" arrayet og påny gemmes i localStorage.*/
//opdatering af localStorage: https://stackoverflow.com/questions/19635077/adding-objects-to-array-in-localstorage
searchIcon.addEventListener("click", function () {
	addToArray(input.value)
	savedCities.push(input.value);
	localStorage.setItem("cities", JSON.stringify(savedCities));
} );

/*En eventListener bliver sat på inputfeltet. Her bruges keypress, så alle taster
trykket på bliver aflyttet. For hver tryk bliver den trykkede tast sendt til
funktionen "sendURL" som parameter.*/
input.addEventListener("keypress", function() {
  sendURL(event.key);
})

/*Denne funktion finder ud af om den knap der er blevet trykket i input feltet
er enter. Hvis dette er tilfældet skal funktionen "addToArray" køres med værdien
intastet i inputfeltet. Derudover skal denne værdi også tilføjes til
"savedCities" array og derefter lægges på ny i localStorage.*/
function sendURL (enter) {
	if(event.key=="Enter"){
		savedCities.push(input.value);
		localStorage.setItem("cities", JSON.stringify(savedCities));
		addToArray(input.value);
	}
}

/*funktionen sender en forespørgsel til openWeather, for at hente API'en og
forskellige informationer derfra. Alle disse funktioner er i JSON og skal derfor
først skives om til JavaScript, før vi kan arbejde med dem. Derfor gemmes
JSON.parse() i en variabel. For at sende forspørgelsen afsted skal vi bruge en
"XMLHttpRequest()". Disse er gemt i forskellige variabler i toppen, alt efter
hvilken funktionalitet de er til. Byens navn bliver sendt med som parameter,
og brugt i linket, hvorfra informationerne skal hentes. Tilsidst køres
funktionen "getForecast"*/
function getCity(city){
  ajaxRequestCurrent.onreadystatechange = function(){

      if(ajaxRequestCurrent.readyState == 4){
            //the request is completed, now check its status
          if(ajaxRequestCurrent.status == 200){
                //turn JSON into object
              var jsonObjCurrent = JSON.parse(ajaxRequestCurrent.responseText);
        showIcon(jsonObjCurrent.weather[0].icon);
        showTemprature(jsonObjCurrent.main.temp);
				showCity(city);
				getForecast(city);

            }
        }
    }

  var weather = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=547d9d614973c7dc888cd7cc61b23c04'
  ajaxRequestCurrent.open('GET', weather);
  ajaxRequestCurrent.send();
}

//funktionen er på mange måder som "getcity". Den tager også byens navn som parameter
function getForecast (city) {
  ajaxRequestForecast.onreadystatechange = function(){

      if(ajaxRequestForecast.readyState == 4){
          //the request is completed, now check its status
          if(ajaxRequestForecast.status == 200){
              //turn JSON into object
              var jsonObjForecast = JSON.parse(ajaxRequestForecast.responseText);
/*Der bliver her brugt et for loop for at løbe igennem de første 5 objecter i det
array der hedder list fra API'en. Her bliver den string der indeholder dato og tid delt op,
så vi tilsidst kun har timer og minutter. Efter dette bliver der lavet forskellige
elementer der skal indeholde informationerne fra disse objecter. Som set tideligere
ved "addToArray".*/
							for (i = 0; i < 5; i++) {
								var date = jsonObjForecast.list[i].dt_txt
								var timeOfDay = date.split("");
								var timeOfForecast = timeOfDay[11] + timeOfDay[12] + timeOfDay[13] + timeOfDay[14] + timeOfDay[15];
								var forecastDiv = document.createElement("div");
								forecastDiv.setAttribute("class", "Forecastbox");
								var forecastTimeBox = document.createElement("p")
								forecastTimeBox.innerHTML = timeOfForecast;
								var img = document.createElement("img");
								var forecastIcon = jsonObjForecast.list[i].weather[0].icon
								img.src= 'https://openweathermap.org/img/wn/'+ forecastIcon + '@2x.png';
								var forecastTempBox = document.createElement("p");
								//tempraturen er opgivet i Kelvin og skal derfor omregnes til celsius
								forecastTempBox.innerHTML = Math.round(jsonObjForecast.list[i].main.temp, 10) - 273 + "°"; //Kode virker ikke hvis den bliver delt op i flere variabler
								forecastBox.appendChild(forecastDiv);
								forecastDiv.appendChild(forecastTimeBox);
								forecastDiv.appendChild(img);
								forecastDiv.appendChild(forecastTempBox);


							}


							}
          }
      }


  var forecast = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=547d9d614973c7dc888cd7cc61b23c04'
  ajaxRequestForecast.open('GET', forecast);
  ajaxRequestForecast.send();
}

/*Funktionen virker som de andre forespørgelser, men istedet for et bynavn, så
bruges position fundet via geolocation. Den URL der skal sendes ser derfor en
anelse anderledes ud. Når informationerne er hentet, findes navnet på den by som
der er blevet fundet frem til og sendes til getCity */
function getLocationWeather (lat, lon) {
  ajaxRequestLocation.onreadystatechange = function(){

      if(ajaxRequestLocation.readyState == 4){
          //the request is completed, now check its status
          if(ajaxRequestLocation.status == 200){
              //turn JSON into object
              var jsonObjLocation = JSON.parse(ajaxRequestLocation.responseText);
							getCity(jsonObjLocation.name);
          }
      }
  }

  var location = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=547d9d614973c7dc888cd7cc61b23c04'
  ajaxRequestLocation.open('GET', location);
  ajaxRequestLocation.send();
}

//Navnet på byen der bliver vist bliver vist i CityHeader
function showCity (city) {
  cityHeader.innerHTML = city;
}

//Tempratueren bliver omregnet fra kelvin til celsius og vist på siden
function showTemprature (temp) {
  var temprature = document.getElementById("Celsius");
  var celsius = Math.round(parseInt(temp, 10) - 273.15);
  temprature.innerHTML= celsius + "°";
}

//Ikonet navnet bliver sendt og brugt til at sætte sourcen på billedet der bliver vist.
function showIcon(icon) {
	iconBox.style.display = "block";
  iconBox.src = 'https://openweathermap.org/img/wn/'+ icon + '@2x.png';
};



// Function til at skifte baggrund alt efter tidspunkt på dagen.
function timeBackground (hour) {
	if (hour >= 8 && hour < 10) {
		background.style.backgroundImage = "url('img/SunRise.jpg')";
	} else if (hour >= 10 && hour < 18) {
		background.style.backgroundImage = "url('img/Daylight.jpg')";
	} else if (hour >= 18 && hour < 20) {
		background.style.backgroundImage = "url('img/SunSet.jpeg')";
	} else {
		background.style.backgroundImage = "url('img/Nightsky.jpg')";
	}
}
