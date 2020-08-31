/* jshint esversion: 6 */
/* global console */
/* global Vue */
/* global axios */

(function() {
    'use strict';

    // Компонент для ввода api key от openweathermap
    Vue.component('page-request-api', {
        template: `
            <div>
                Введите api key openweathermap
                <input v-model="input_api_key" />
                <button @click="$emit('api_key_save', input_api_key)">Сохранить</button>
            </div>
        `,

        data () {
            return {
                input_api_key: null
            };
        }

    });

    // компонент для отображения текущей погоды
    Vue.component('page-weather-current', {
        props: ['weather_current'],

        template: `
            <div style="width: 254px; padding: 4px; margin-bottom: 4px; border: 1px solid black">
                <div>Текущая погода:</div>
                <div style='padding-left: 16px'>температура:
                    <template v-if="weather_current && weather_current.main && weather_current.main.temp">{{ weather_current.main.temp }}</template>
                    <template v-else> - </template>
                </div>
                <div style='padding-left: 16px'>давление:
                    <template v-if="weather_current && weather_current.main && weather_current.main.pressure">{{ weather_current.main.pressure }}</template>
                    <template v-else> - </template>
                </div>
                <div style='padding-left: 16px'>влажность воздуха:
                    <template v-if="weather_current && weather_current.main && weather_current.main.humidity">{{ weather_current.main.humidity }}</template>
                    <template v-else> - </template>
                </div>
            </div>
        `
    });


    // компонент для отображения прогноза погоды
    Vue.component('page-weather-forecast', {
        props: ['weather_forecast'],

        template: `
            <div style="width: 254px; padding: 4px; border: 1px solid black">
                <div>Прогноз погоды (
                    <template v-if="weather_forecast">{{ weather_forecast.dt_txt.slice(0, 16) }}</template>
                    <template v-else>--:--</template>
                ):</div>
                <div style='padding-left: 16px'>температура:
                    <template v-if="weather_forecast && weather_forecast.main && weather_forecast.main.temp">{{ weather_forecast.main.temp }}</template>
                    <template v-else> - </template>
                </div>
                <div style='padding-left: 16px'>давление:
                    <template v-if="weather_forecast && weather_forecast.main && weather_forecast.main.pressure">{{ weather_forecast.main.pressure }}</template>
                    <template v-else> - </template>
                </div>
                <div style='padding-left: 16px'>влажность воздуха:
                    <template v-if="weather_forecast && weather_forecast.main && weather_forecast.main.humidity">{{ weather_forecast.main.humidity }}</template>
                    <template v-else> - </template>
                </div>
            </div>
        `
    });

    // главное приложение
    const app = new Vue({

        methods: {

            // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Получение_случайного_целого_числа_в_заданном_интервале_включительно
            random(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },

            // сохранение api_key
            api_key_save: function(api_key_value) {
                console.log(api_key_value);
                this.api_key = api_key_value;
                this.owm_get_current();
                this.own_get_forecast();
            },

            // метод для получение текущей погоды
            owm_get_current: function() {
                //let url = 'https://'+ this.openweathermap_api_servers[this.random(0, this.openweathermap_api_servers.length - 1)]+'/data/2.5/weather?q=Chelyabinsk&lang=ru&units=metric&appid=' + this.api_key;
                let url = 'https://api.openweathermap.org/data/2.5/weather?q=Chelyabinsk&lang=ru&units=metric&appid=' + this.api_key;
                axios.get(url, { crossdomain: true }).then(response => {
                    if (response.status === 200) {
                        this.weather_current = response.data;
                    } else {
                        console.warn('%c Warning ', 'color: white; background-color: #fa8231', response);
                    }
                }).catch(error => {
                    console.error(error);
                });
            },

            // метод для получения прогноза погоды
            own_get_forecast: function() {
                // let url = 'https://'+ this.openweathermap_api_servers[this.random(0, this.openweathermap_api_servers.length - 1)]+'/data/2.5/forecast?q=Chelyabinsk&units=metric&lang=ru&appid=' + this.api_key;
                let url = 'https://api.openweathermap.org/data/2.5/forecast?q=Chelyabinsk&units=metric&lang=ru&appid=' + this.api_key;
                axios.get(url, { crossdomain: true }).then(response => {
                    if (response.status === 200) {
                        this.weather_forecast = response.data.list[this.weather_forecast_index];
                    } else {
                        console.warn('%c Warning ', 'color: white; background-color: #fa8231', response);
                    }
                }).catch(error => {
                    console.error(error);
                });
            },

            // 
            forecast_prev: function() {
                if (this.weather_forecast_index > 0) {
                    --this.weather_forecast_index;
                    this.own_get_forecast();
                }
            },

            // 
            rorecast_next: function() {
                if (this.weather_forecast_index < 39) {
                    ++this.weather_forecast_index;
                    this.own_get_forecast();
                }
            }
        },

        template: `
            <div>
                <page-request-api v-if="!api_key" v-on:api_key_save="api_key_save"/>
                <page-weather-current v-if="api_key" :weather_current="weather_current" />
                <page-weather-forecast v-if="api_key" :weather_forecast="weather_forecast" />
                <div style="display: grid; grid-template-columns: 1fr 1fr; width: 254px; padding: 4px" v-if="api_key">
                    <button @click="forecast_prev" :disabled="weather_forecast_index <= 0" >\<\<</button>
                    <button @click="rorecast_next" :disabled="weather_forecast_index >= 39">\>\></button>
                </div>
            </div>
        `,

        data () {
            return {
                api_key: null,
                weather_current: null,
                weather_forecast: null,
                weather_forecast_index: 0,
                openweathermap_api_servers: [
                    '82.196.7.246',
                    '82.196.7.246',
                    '37.139.20.5'
                ],
            };
        }

    });

    app.$mount('.vue-app');
})();