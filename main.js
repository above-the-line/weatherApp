//APP DESCRIPTION
// This app has a loading screen which disappears after weather
// information from a predefined list of cities is successfully called.
// The below JavaScript manipulates HTML 
// in which a Twitter Bootstrap Carousel has been specified.
// After calling the WeatherBit API, it injects the data into 
// the HTML template and copies the current slide for manipulation
// and construction of the next one.
// To construct a slide, some helper functions are called
// to format the data and use custom images.
// There is some logic for handling API errors,
// and capacity for 

//DEPENDENCIES 
// This program relies on JQuery library which is imported via HTML.

//PROGRAM STRUCTURE
// There is:
// 1. An IFFE which defines and controls program state
// 2. Worker functions that help the controller by
//    returning values that it assigns to various properties
//    of the state object
// 
// A largely functional style of programming is used,
// When called to do work, some worker functions have side effects,
// and return true on completion


// STATE MONITOR AND PROGRAM CONTROLLER
// The main immediately invoked function that controls the program.
// The mainProgramLoop function routes state dowon a particular course
// depending on flags that were activated, by previous routes.
// To achieve this:
// 1. the state object and its flags (properties) are defined.
// 2. the mainProgramLoop function is defined
// 3. the resulting state of one loop is saved in a variable 
(async function programController () {
  'use strict';
  // STATE DEFINITION (VARIABLES AND CONSTANTS)
  let state = {};
  state.API_KEY = '7df1de0425504cf19926e85bb2094e0a';   
  state.WEATHERBIT_API_URL = 
  "https://cors-anywhere.herokuapp.com/http://api.weatherbit.io/v2.0/forecast/daily?";
  state.TARGET_CITIES = 
  {
  "Sydney": { lat: '-33.8688', lon: '151.2093' },
  "Brisbane": { lat: '-27.4698', lon: '153.0251' },
  "Melbourne": { lat: '-37.8136', lon: '144.9631' },
  "Snowy Mountains": { lat: '-36.5000', lon: '148.3333' }
  };
  state.TARGET_CITIES_ARRAY = Object.keys(state.TARGET_CITIES);
  state.finalizedCityWeatherInformationObject = {};
  state.UIupdated = false;
  state.APIcallMade = false;
  state.APIcallSuccess = false;
  state.APIcallStatusCode = 0;
  state.APIcallStatusText = "";


  //STARTS THE MAIN PROGRAM LOOP
  // In case there is a need to keep checking for updates
  // or, make multiple attempts after a failed call
  // the state object could be wrapped in a 
  let firstLoopState = await mainProgramLoop(state);
  // let secondLoopState = await mainProgramLoop(firstLoopState);



  //MAIN PROGRAM LOOP -- STATE CONTROLLER
  // This function controls the "state" of the program, by
  // routing the state object down a particular course depending on the
  // value of the APIcallMade, APIcallSuccess and UIupdated parameters,
  // and then returning that updated state object to the caller
  // for use in the next loop
  // 
  // APIcallSuccess and UIupdated parameters are like flags
  // that start/stop program behavior
  // 
  // The mainProgramLoop handles API calls and UI updates.
  async function mainProgramLoop(state){
  
    function displayMessageOnLoadingScreen(message, instruction = ""){
      document.getElementById("loadingMessage").innerHTML = message + "<br><br>" + instruction;
    }

    //QUIT LOOP IF UI ALREADY UPDATED
    if(state.UIupdated == true){
      let message = "Quitting loop, already updated"
      displayMessageOnLoadingScreen(message);  
      return state;
    }

    //CALL WEATHER API 
    // If the API has not been called
    // then try call API (getCityWeatherData function)
    // getCityWeatherData returns finalizedCityWeatherInformationObject
    // hence its assignment to its namesake.
    // If the promise resolves, i.e. no error is thrown,
    // then set the APIcallSuccess flag to true,
    // and then inject the data into slides and update the UI
    // createCityWeatherDisplayCarousel returns true when done
    // hence it's it's invocation as an expression of state.UIupdated
    // Finally, remove the loading screen (set display none) 
    if(state.APIcallMade == false){ 
      let message = "Please wait while the weather data is called"+"<br>"+
      "Currently checking " + state.TARGET_CITIES_ARRAY.length + " cities...";
      displayMessageOnLoadingScreen(message)

      //THE SUCCESSFUL PROGRAM ROUTE:
      // 1. call API
      // 2. create slides with returned data and inject into DOM
      // 3. remove loading screen
      try {
          state.APIcallMade = true;
          state.finalizedCityWeatherInformationObject = 
          await getCityWeatherData(state.TARGET_CITIES, state.API_KEY, state.WEATHERBIT_API_URL);
          state.APIcallSuccess = true;
          state.UIupdated = 
          createCityWeatherDisplayCarousel(state.finalizedCityWeatherInformationObject, state.TARGET_CITIES_ARRAY);
          document.getElementById("loadingContainer").style.display = "none";
          document.getElementById("loadingCircleContainer").style.display = "none";    
      } 
      //HANDLING AN API CALL ERROR 
      // Error returned from callWeatherAPI via getCityWeatherData
      // Display a particular message depening on the class of 
      // HTTP response (status code band)
      // return state for next loop 
      // (could track number of attempts or periodically poll in future)
      catch(error){
        state.APIcallSuccess = false;
        state.APIcallStatusCode = error.status;
        state.APIcallStatusText = "JQueryXMLHTTPRequest failed with error code " 
        + error.status + ": " + error.statusText + ". <br>" + error.responseJSON.error;
        if (300 <= state.APIcallStatusCode && state.APIcallStatusCode <= 399){
          let instruction = "A redirection error occured, try refreshing the page at a later time.";
          displayMessageOnLoadingScreen(state.APIcallStatusText, instruction);
          return state;
        }
        if (400 <= state.APIcallStatusCode && state.APIcallStatusCode <= 499){
          let instruction = "A client side error occured, contact the app developer before trying again."
          displayMessageOnLoadingScreen(state.APIcallStatusText, instruction);
          return state;
        }
        if (500 <= state.APIcallStatusCode && state.APIcallStatusCode <= 599){
          let instruction = "A client server error occured, try refreshing the page at a later time or contact app developer."
          displayMessageOnLoadingScreen(state.APIcallStatusText, instruction);
          return state;
        }
        else{
          let instruction = "An unknown error occured."
          displayMessageOnLoadingScreen(instruction);  
          return state;
        }
      }
    } // CallWeatherAPI Route (if statement)
  } // mainProgramLoop
} // programController
)();


//RENDER IMAGES AS PER THE RULES DEFINED BELOW
// Returns a particular URL depending on the value submitted
// cloudy: "https://bit.ly/webApp_Assets_cloudy", returned API code (801 - 804) + 700
// rain: "https://bit.ly/webApp_Assets_rain", returned API code 300 - 522 + 900
// snow: "https://bit.ly/webApp_Assets_snow", returned API code (600 - 623)
// sunny: "https://bit.ly/webApp_Assets_sunny",  returned API code 800 
// thunderStorm: "https://bit.ly/webApp_Assets_thunderStorm"  returned API code (200 - 233)
function imageRenderer(imageCode){
  let calledImageURL = ""
  if ( 200 <= imageCode && imageCode <= 233){
    return calledImageURL = "https://bit.ly/webApp_Assets_thunderStorm";
  }
  if ( 300 <= imageCode && imageCode <= 522 || imageCode == 900){
    return calledImageURL = "https://bit.ly/webApp_Assets_rain";
  }
  if ( 600 <= imageCode && imageCode <= 623 ){
    return calledImageURL = "https://bit.ly/webApp_Assets_snow";
  }
  if ( imageCode == 800 ){
    return calledImageURL = "https://bit.ly/webApp_Assets_sunny";
  }
  if ( 800 < imageCode && imageCode < 805 || imageCode == 700){
    return calledImageURL = "https://bit.ly/webApp_Assets_cloudy";
  }
}
  


//CALL API AND DESTRUCTURE DATA FROM API RESPONSE FOR ONE TARGET CITY  (JQuery)
// Using city name, lat, long, API URL and API KEY,
// this function destructures current weather conditions plus those for next five days
// and returns the compiledCityWeatherInformationObject for ONE target city
// to the calling function getCityWeatherData (which calls this function for each city)
async function callWeatherAPI (currentCityName, currentCityLat, currentCityLon, API_KEY, WEATHERBIT_API_URL) {
  let compiledCityWeatherInformationObject = {};
  try {
    var jQueryXMLHTTPResponse = await $.ajax({
      dataType: "json",
      url: WEATHERBIT_API_URL,
      data: {
        key: API_KEY,
        lon: currentCityLon,
        lat: currentCityLat
      }
    });
    const [weatherbitResponse1, weatherbitResponse2, weatherbitResponse3,
        weatherbitResponse4, weatherbitResponse5, weatherbitResponse6,
        ...weatherbitResponseRemaining10] = await jQueryXMLHTTPResponse.data;
    return compiledCityWeatherInformationObject[currentCityName] = {
      "todaysIconCode": weatherbitResponse1.weather['code'], 
      "todaysCurrentTemp": Math.round(weatherbitResponse1['temp']),
      "todaysLow": Math.round(weatherbitResponse1['min_temp']),
      "todaysHigh": Math.round(weatherbitResponse1['max_temp']),
      "todaysDescription": weatherbitResponse1.weather['description'], 
      "todaysDate": weatherbitResponse1['valid_date'],
      "todayPlusOneDate": weatherbitResponse2['valid_date'],
      "todayPlusOneIconCode": weatherbitResponse2.weather['code'],
      "todayPlusOneLow": Math.round(weatherbitResponse2['min_temp']),
      "todayPlusOneHigh": Math.round(weatherbitResponse2['max_temp']),
      "todayPlusTwoDate": weatherbitResponse3['valid_date'],
      "todayPlusTwoIconCode": weatherbitResponse3.weather['code'],
      "todayPlusTwoLow": Math.round(weatherbitResponse3['min_temp']),
      "todayPlusTwoHigh": Math.round(weatherbitResponse3['max_temp']),
      "todayPlusThreeDate": weatherbitResponse4['valid_date'],
      "todayPlusThreeIconCode": weatherbitResponse4.weather['code'],
      "todayPlusThreeLow": Math.round(weatherbitResponse4['min_temp']),
      "todayPlusThreeHigh": Math.round(weatherbitResponse4['max_temp']),
      "todayPlusFourDate": weatherbitResponse5['valid_date'],
      "todayPlusFourIconCode": weatherbitResponse5.weather['code'],
      "todayPlusFourLow": Math.round(weatherbitResponse5['min_temp']),
      "todayPlusFourHigh": Math.round(weatherbitResponse5['max_temp']),
      "todayPlusFiveDate": weatherbitResponse6['valid_date'],
      "todayPlusFiveIconCode": weatherbitResponse6.weather['code'],
      "todayPlusFiveLow": Math.round(weatherbitResponse6['min_temp']),
      "todayPlusFiveHigh": Math.round(weatherbitResponse6['max_temp'])
    }
  }
  catch (error) {
    return error; //Returns to getCityWeatherData catch
  }
};

//CALL WEATHER API FOR EACH TARGET CITY   
// Makes API calls for each member of the array of target cities.
// Returns finalizedCityWeatherInformationObject to main program function  
async function getCityWeatherData (TARGET_CITIES, API_KEY, WEATHERBIT_API_URL){
  let finalizedCityWeatherInformationObject = {};
  for (let targetCity in TARGET_CITIES){
    let currentCityName = targetCity;
    let currentCityLat = TARGET_CITIES[targetCity].lat;
    let currentCityLon = TARGET_CITIES[targetCity].lon;
    console.log("getCityWeatherData is running for "+currentCityName)
    try{
        finalizedCityWeatherInformationObject[targetCity] = await callWeatherAPI(
          currentCityName,
          currentCityLat,
          currentCityLon,
          API_KEY,
          WEATHERBIT_API_URL
        );
    }
    catch (error){
        return error; //returns to MainProgramLoop catch
    }
  }
  return finalizedCityWeatherInformationObject;
}

//CONVERT API RESPONSE DATES TO NAME OF WEEK
// Assumes that the current date (local time) equals the current date from API response
// Returns name of day of week to calling function createCityWeatherDisplaySlide
function numberToDay(dateToConvert) {
  let dateAsJSDate = new Date(dateToConvert);
  let weekday = new Array(7);
  weekday[0] = "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tue";
  weekday[3] = "Wed";
  weekday[4] = "Thu";
  weekday[5] = "Fri";
  weekday[6] = "Sat";
  let dayOfWeek = weekday[dateAsJSDate.getDay()];
  return dayOfWeek;
}

//SLIDE CREATOR: DATA DELIVERY SYSTEM
// Does not modify <div> element properties, rather individual data points.
// Modifies data within the <div class="item"> Bootstrap Template already declared in HTML
// (This side-effect is used to update the UI when there is only ONE slide)
// Copies innerHTML of <div class="item"> and 
// returns that HTML payload to createDisplayCarousel function for injection into DOM
function createCityWeatherDisplaySlide(city, finalizedCityWeatherInformationObject){
  document.getElementById("targetCityName").innerHTML = city;      
  document.getElementById("todaysIcon").setAttribute('src', imageRenderer(finalizedCityWeatherInformationObject[city].todaysIconCode));
  document.getElementById("todaysCurrentTempNumber").innerHTML = finalizedCityWeatherInformationObject[city].todaysCurrentTemp;
  document.getElementById("todaysLowTempNumber").innerHTML = finalizedCityWeatherInformationObject[city].todaysLow;
  document.getElementById("todaysHighTempNumber").innerHTML = finalizedCityWeatherInformationObject[city].todaysHigh;
  document.getElementById("todaysDescription").innerHTML = finalizedCityWeatherInformationObject[city].todaysDescription;
  document.getElementById("todayPlusOneIcon").setAttribute('src', imageRenderer(finalizedCityWeatherInformationObject[city].todayPlusOneIconCode));
  document.getElementById("dayPlusOne").innerHTML = numberToDay(finalizedCityWeatherInformationObject[city].todayPlusOneDate);
  document.getElementById("lowPlusOne").innerHTML =finalizedCityWeatherInformationObject[city].todayPlusOneLow;
  document.getElementById("highPlusOne").innerHTML = finalizedCityWeatherInformationObject[city].todayPlusOneHigh;
  document.getElementById("todayPlusTwoIcon").setAttribute('src', imageRenderer(finalizedCityWeatherInformationObject[city].todayPlusTwoIconCode));
  document.getElementById("dayPlusTwo").innerHTML = numberToDay(finalizedCityWeatherInformationObject[city].todayPlusTwoDate);
  document.getElementById("lowPlusTwo").innerHTML =finalizedCityWeatherInformationObject[city].todayPlusTwoLow;
  document.getElementById("highPlusTwo").innerHTML = finalizedCityWeatherInformationObject[city].todayPlusTwoHigh;
  document.getElementById("todayPlusThreeIcon").setAttribute('src', imageRenderer(finalizedCityWeatherInformationObject[city].todayPlusThreeIconCode));
  document.getElementById("dayPlusThree").innerHTML = numberToDay(finalizedCityWeatherInformationObject[city].todayPlusThreeDate);
  document.getElementById("lowPlusThree").innerHTML =finalizedCityWeatherInformationObject[city].todayPlusThreeLow;
  document.getElementById("highPlusThree").innerHTML = finalizedCityWeatherInformationObject[city].todayPlusThreeHigh;
  document.getElementById("todayPlusFourIcon").setAttribute('src', imageRenderer(finalizedCityWeatherInformationObject[city].todayPlusFourIconCode));
  document.getElementById("dayPlusFour").innerHTML = numberToDay(finalizedCityWeatherInformationObject[city].todayPlusFourDate);
  document.getElementById("lowPlusFour").innerHTML =finalizedCityWeatherInformationObject[city].todayPlusFourLow;
  document.getElementById("highPlusFour").innerHTML = finalizedCityWeatherInformationObject[city].todayPlusFourHigh;
  document.getElementById("todayPlusFiveIcon").setAttribute('src', imageRenderer(finalizedCityWeatherInformationObject[city].todayPlusFiveIconCode));
  document.getElementById("dayPlusFive").innerHTML = numberToDay(finalizedCityWeatherInformationObject[city].todayPlusFiveDate);
  document.getElementById("lowPlusFive").innerHTML =finalizedCityWeatherInformationObject[city].todayPlusFiveLow;
  document.getElementById("highPlusFive").innerHTML = finalizedCityWeatherInformationObject[city].todayPlusFiveHigh;
  let modifiedSlideHTML = document.getElementById("JSinjectionTargetSlideCreationPoint").innerHTML;
  return modifiedSlideHTML;
}

//CAROUSEL CREATOR: CONTROLS AND INJECTS SLIDES
// Modifies <div> properties, not the individual data points.
// Updates existing <div class="item"> with called weather data.
// Copies modified <div class="item"> to arrayOfSlidesHTML - called later for presentation.
// 
// For the FIRST city in the TARGET_CITIES_ARRAY,  
// a new slide is created and copied to the arrayOfSlidesHTML - BUT NOT INJECTED
// since createCityWeatherDisplaySlide function has already updated the DOM as a side-effect.
// 
// If there's MORE THAN ONE city in the TARGET_CITIES_ARRAY,
// since completeSlide0HTML was already assigned to arrayOfSlidesHTML[0] position
// remaining slides are created and added to arrayOfSlidesHTML
// Iterates over arrayOfSlidesHTML, wraps and injects remaining slides into DOM 
// at the "JSinjectionTargetSlideMountPoint"
// 
// Returns true to main program function (setting UIupdated to true)
function createCityWeatherDisplayCarousel(finalizedCityWeatherInformationObject, TARGET_CITIES_ARRAY){
  let arrayOfSlidesHTML = [];
  for (let city in finalizedCityWeatherInformationObject){
    //Create (and inject as side-effect) first slide and copy it to arrayOfSlidesHTML
    if(Object.keys(finalizedCityWeatherInformationObject)[0] == city){
      let halfCompleteSlide0HTML = createCityWeatherDisplaySlide(city, finalizedCityWeatherInformationObject);
      document.getElementById("JSinjectionTargetSlideCreationPoint").setAttribute('class', 'carousel-item active');
      //First slide copies the entire slide (<div class="carousel item">) (innerHTML of MountPoint)
      //because it replaces innerHTML of JSinjectionTargetSlideMountPoint 
      //(others require a createElement and therefore only copy innerHTML of CreationPoint)
      document.getElementById("JSinjectionTargetSlideCreationPoint").innerHTML = halfCompleteSlide0HTML;
      let completeSlide0HTML = document.getElementById("JSinjectionTargetSlideMountPoint").innerHTML;
      arrayOfSlidesHTML.push(completeSlide0HTML);
    } 
      // ONLY EXECUTED IF THERE'S MORE THAN ONE TARGET CITY
    else {
      //Create and inject indicator (a Bootstrap Carousel requirement)
      let slideIndex = TARGET_CITIES_ARRAY.indexOf(city);
      let HTMLforNewSlideIndicator = document.createElement('li');
      HTMLforNewSlideIndicator.setAttribute('data-target','#targetCity');
      HTMLforNewSlideIndicator.setAttribute('data-slide-to',slideIndex);
      document.getElementById("JSinjectionTargetSlideIndicator").appendChild(HTMLforNewSlideIndicator);
      //Update existing slide with new city data
      //I chose the SlideCreationPoint (incomplete carousel slide) because I will wrap 
      //the slide in an "item" div (twitter bootstrap requirement) below
      let HalfCompleteSlideHTML = createCityWeatherDisplaySlide(city, finalizedCityWeatherInformationObject);
      document.getElementById("JSinjectionTargetSlideCreationPoint").innerHTML = HalfCompleteSlideHTML;
      //Copy freshly created slide into arrayOfSlidesHTML
      //because injecting slides above slide0 via appendChild and createELement 
      let nextSlideHTML = document.getElementById("JSinjectionTargetSlideCreationPoint").innerHTML;
      arrayOfSlidesHTML.push(nextSlideHTML);
    }
  }
  // IF THERE'S MORE THAN ONE SLIDE, INJECT STORED SLIDES INTO THE PAGE
  if (TARGET_CITIES_ARRAY.length > 0){
    // inject first array member into existing HTML slide
    document.getElementById("JSinjectionTargetSlideMountPoint").innerHTML = arrayOfSlidesHTML[0];
    // inject remaining array members into newly created HTML slides 
    for (let iterator = 1; iterator < TARGET_CITIES_ARRAY.length; iterator++){
      let HTMLforNextNewSlide = document.createElement('div');
      HTMLforNextNewSlide.setAttribute('class', 'carousel-item');
      HTMLforNextNewSlide.innerHTML = arrayOfSlidesHTML[iterator];
      document.getElementById("JSinjectionTargetSlideMountPoint").appendChild(HTMLforNextNewSlide);
    }
  }
return true; //sets UIupdated to true
}

