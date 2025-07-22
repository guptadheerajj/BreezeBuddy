import { format } from "date-fns";
import "../css/normalize.css";
import "../css/style.css";

const key = API_KEY;
const btn = document.querySelector("button");

async function getWeather(location) {
	try {
		const response = await fetch(
			`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&include=fcst,hours&key=${key}`,
			{
				mode: "cors",
			}
		);
		if (!response.ok) {
			const error = new Error(
				`Failed to fetch weather data: ${response.status} ${response.statusText}`
			);
			error.name = "WeatherAPIError";
			throw error;
		}

		const json = await response.json();
		return json;
	} catch (error) {
		if (error.name === "WeatherAPIError") {
			throw error;
		}

		const otherError = new Error(`${error.message}`);
		otherError.name = "NetworkError";
		throw otherError;
	}
}

btn.addEventListener("click", () => {
	getWeather("Pune")
		.then((weatherDataJson) => printData(weatherDataJson))
		.catch((error) => {
			console.log(error);
			handleGetWeatherError(error);
		});
});

function printData(weatherDataJson) {
	console.log("----Hero Information----");
	console.log(`Temprature: ${weatherDataJson.days[0].temp}°C`);
	console.log(`High: ${weatherDataJson.days[0].tempmax}°C`);
	console.log(`Low: ${weatherDataJson.days[0].tempmin}°C`);
	console.log(`Feels Like: ${weatherDataJson.days[0].feelslike}°C`);
	console.log(`Condition: ${weatherDataJson.days[0].conditions}`);
	console.log(`Icon: ${weatherDataJson.days[0].icon}`);

	console.log("\n\n----Current COnditions----");
	console.log(`Wind: ${weatherDataJson.days[0].windspeed} km/h`);
	console.log(`Humidity: ${weatherDataJson.days[0].humidity}%`);
	console.log(`UV Index: ${weatherDataJson.days[0].uvindex}`);
	console.log(`Pressure: ${weatherDataJson.days[0].pressure} hPa`);

	const hourlyForecast = get24HourData(weatherDataJson);
	console.log("\n\n----Hourly Forecast----");
	hourlyForecast.map((hourForecast) => {
		console.log(`${hourForecast.temp}°C`);
		console.log(hourForecast.precipprob + "%");
		console.log(hourForecast.icon);

		const [hour] = hourForecast.datetime.split(":");
		if (new Date().getHours() === +hour) {
			console.log("Now");
		} else if (hour >= 12) {
			console.log(`${hour - 12} PM`);
		} else if (hour === "00") {
			console.log(`12 AM`);
		} else {
			console.log(`${hour} AM`);
		}
	});

	console.log("\n\n----15 day forecast----");
	weatherDataJson.days.map((day, index) => {
		if (index === 0) console.log("Today");
		const formattedDate = format(day.datetime, "EEEE, LLL dd");
		const highTemp = day.tempmax;
		const lowTemp = day.tempmin;
		console.log(formattedDate);
		console.log(day.icon);
		console.log(`${highTemp}°/${lowTemp}°\n`);
	});
}

function get24HourData(weatherDataJson) {
	const [today, tomorrow] = weatherDataJson.days;
	const currentHour = new Date().getHours();
	const hourlyFOrecastData = [
		...today.hours.slice(currentHour),
		...tomorrow.hours.slice(0, currentHour),
	];
	return hourlyFOrecastData;
}

function handleGetWeatherError() {
	// console.log(error);
	// render error page
}
