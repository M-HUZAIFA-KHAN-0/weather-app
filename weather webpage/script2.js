let btn = document.querySelector('#btn');

btn.addEventListener('click', async (e) => {
    e.preventDefault();

    let cityName = document.getElementById('search').value;

    try {
        const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=0c8d48538f2d4a8f8e6165636240409&days=5&q=${cityName}`);
        console.log(response);

        // Update city, country, and date/time information
        document.getElementById('city').innerHTML = `${response.data.location.name}`;
        document.getElementById('country').innerHTML = `${response.data.location.country}`;
        document.getElementById('last-update').innerHTML = `Last update: ${(response.data.current.last_updated).slice(11, 18)}`;
        document.getElementById('date').innerHTML = `Today Date: ${(response.data.location.localtime).slice(0, 11)} &nbsp; &nbsp; Current Time: ${(response.data.location.localtime).slice(11, 18)}`;
        document.getElementById('temp-icon').innerHTML = `
            <img style="width: 100px; height: 100px; transform: scale(1.4);" src='https://${response.data.current.condition.icon}'/>
            <div class="sunny">${response.data.current.condition.text}</div>
        `;
        
        // Update additional weather details
        document.getElementById('cloud').innerHTML = `${response.data.current.cloud} %`;
        document.getElementById('humidity').innerHTML = `${response.data.current.humidity} %`;
        document.getElementById('pressure').innerHTML = `${response.data.current.pressure_mb} mb`;
        document.getElementById('pricipitation').innerHTML = `${(response.data.current.precip_mm) * 100} %`;

        // Function to get the day of the week from a date string
        function getDayOfWeek(dateString) {
            const date = new Date(dateString);
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            return daysOfWeek[date.getDay()];
        }

        const forecastDays = response.data.forecast.forecastday;

        // Get the current time and date
        const now = new Date();
        const currentHour = now.getHours();
        const currentDate = now.getDate();

        // Extract the hourly forecast for today and tomorrow
        const todayForecast = forecastDays[0].hour;
        const tomorrowForecast = forecastDays[1] ? forecastDays[1].hour : [];

        // Combine today's and tomorrow's forecast
        const combinedForecast = [...todayForecast, ...tomorrowForecast];

        // Filter the forecast data to get the next 8 hours
        const nextEightHours = combinedForecast.filter(hourData => {
            const forecastTime = new Date(hourData.time);
            const forecastHour = forecastTime.getHours();
            const forecastDate = forecastTime.getDate();

            return (forecastDate === currentDate && forecastHour > currentHour) ||
                (forecastDate === currentDate + 1 && forecastHour <= (currentHour + 8) % 24);
        }).slice(0, 8); // Ensure only 8 hours are selected

        // Temperature data
        const tempC = response.data.current.temp_c;
        const tempF = response.data.current.temp_f;

        // Function to update temperature and forecast information
        function updateTemperature(temp, unit) {
            if (unit === 'C') {
                document.getElementById('temperature').innerHTML = `${temp}<span style="margin-left: 7px;">°C</span>/<span role="button" id="tem-f" style="opacity: 0.2; cursor: pointer;">F</span>`;
                document.getElementById('real-feel').innerHTML = `${response.data.current.feelslike_c} °C`;
                document.getElementById('wind').innerHTML = `${response.data.current.wind_kph} km/h`;
                
                // Update 5-day forecast
                forecastDays.forEach((day, i) => {
                    const dayOfWeek = getDayOfWeek(day.date);
                    document.getElementById(`day-${i+1}`).innerHTML = `
                        <div>${dayOfWeek}</div> 
                        <img style="width: 30px; height: 30px;" src='https://${day.day.condition.icon}'/> 
                        <div>${day.day.condition.text}</div> 
                        <div>${day.day.avgtemp_c} °C</div>
                    `;
                });

                // Update next 8 hours forecast
                nextEightHours.forEach((forecast, i) => {
                    const timeElement = document.getElementById(`time-${i + 1}`);
                    if (timeElement) {
                        timeElement.innerHTML = `
                            <div>${(forecast.time).slice(11, 16)}</div>
                            <img style="width: 30px; height: 30px;" src="https://${forecast.condition.icon}" alt="Weather icon"/>
                            <div>${forecast.temp_c}°C</div>
                        `;
                    }
                });

                // Switch to Fahrenheit on click
                document.getElementById('tem-f').addEventListener('click', () => {
                    updateTemperature(tempF, 'F');
                });

            } else if (unit === 'F') {
                document.getElementById('temperature').innerHTML = `${temp}<span role="button" id="tem-c" style="margin-left: 8px; opacity: 0.2; cursor: pointer;">C</span>/°F`;
                document.getElementById('real-feel').innerHTML = `${response.data.current.feelslike_f} °F`;
                document.getElementById('wind').innerHTML = `${response.data.current.wind_mph} mph`;

                // Update 5-day forecast
                forecastDays.forEach((day, i) => {
                    const dayOfWeek = getDayOfWeek(day.date);
                    document.getElementById(`day-${i+1}`).innerHTML = `
                        <div>${dayOfWeek}</div> 
                        <img style="width: 30px; height: 30px;" src='https://${day.day.condition.icon}'/> 
                        <div>${day.day.condition.text}</div> 
                        <div style="width: 50px;">${day.day.avgtemp_f} °F</div>
                    `;
                });

                // Update next 8 hours forecast
                nextEightHours.forEach((forecast, i) => {
                    const timeElement = document.getElementById(`time-${i + 1}`);
                    if (timeElement) {
                        timeElement.innerHTML = `
                            <div>${(forecast.time).slice(11, 16)}</div>
                            <img style="width: 30px; height: 30px;" src="https://${forecast.condition.icon}" alt="Weather icon"/>
                            <div>${forecast.temp_f}°F</div>
                        `;
                    }
                });

                // Switch to Celsius on click
                document.getElementById('tem-c').addEventListener('click', () => {
                    updateTemperature(tempC, 'C');
                });
            }
        }

        // Initialize temperature display in Celsius
        updateTemperature(tempC, 'C');

        // Reset the search form
        document.getElementById('cityName').reset();

    } catch (error) {
        console.error(error);
        // Display error message if no results found
        document.getElementById('error-msg').innerHTML = 'No results found.';
        document.getElementById('error-msg').classList.add('error-msg');
        document.getElementById('bg-blur').classList.add('bg-blur');
        
        // Reset the search form
        document.getElementById('cityName').reset();

        // Clear the error message after 2.1 seconds
        setTimeout(() => {
            document.getElementById('error-msg').innerHTML = '';
            document.getElementById('error-msg').classList.remove('error-msg');
            document.getElementById('bg-blur').classList.remove('bg-blur');
        }, 2100);
    }
});
