import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { errorMsg, setCity } from '../store/weather.action.js'
import { CitySearch } from '../components/CitySearch.jsx';
import { Weather } from './Weather.jsx'
import { weatherService } from '../services/weather.service.js';
import { Modal } from '../components/Modal'

export const Home = () => {
    const { cityKey, darkMod, degree, error } = useSelector(state => state.weatherModule)
    const [forecast, setForecast] = useState('')
    const [currentForecast, setCurrentForecast] = useState('')
    const [favorits, setFavorits] = useState('')
    const [cityName, setcityName] = useState('')
    const dispatch = useDispatch()
    let cityId

    useEffect(() => {
        if (cityKey === '') {
            navigator.geolocation.getCurrentPosition(success, navigatorError)
        } else {
            try {
                onGetCityForecast(cityKey)
            } catch (err) {
                dispatch(errorMsg(err))
            }
        }
        return () => {
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const getFavouriteCities = async () => {
            const favoritCities = await weatherService.loadCities()
            setFavorits(favoritCities)
        }
        getFavouriteCities();
        return () => {
        }
        // eslint-disable-next-line
    }, []);

    const success = async (pos) => {
        try {
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude
            const city = await weatherService.getLatLanCoord(lat, lon)
            dispatch(setCity(city.cityKey))
            setcityName(city.LocalizedName)
            await onGetCityForecast(city.Key)
        } catch (err) {
           // console.log(err);
           dispatch(errorMsg(err))
        }
    }
    const navigatorError = () => {
        try {
            dispatch(setCity('215854'))
            dispatch(errorMsg('there was an error to get location'))
        } catch (err) {
            dispatch(errorMsg(err))
        }
    }
    const isDarkMode = () => {
        return darkMod ? 'dark' : ''
    }

    const onSearch = async (searchTerm) => {
        try {
            return await weatherService.searchCityAutoComplete(searchTerm)
        } catch (err) {
            dispatch(errorMsg(err))
        }
    }
    const onGetCityForecast = async (cityKey) => {
        try {
            dispatch(setCity(cityKey))
            const forecast5Day = await weatherService.get5DayForeCast(cityKey, degree)
            const currentForecast = await weatherService.getCityCurrentCondition(cityKey)
            const city = await weatherService.searchCityByCityKey(cityKey)
            setCurrentForecast(currentForecast[0])
            setForecast(forecast5Day.DailyForecasts)
            setcityName(city.LocalizedName)
        } catch (err) {
            dispatch(errorMsg(err))
        }
    }

    const onAddToFavorits = () => {
        try {
            weatherService.saveCity(cityKey, cityName)
            dispatch(errorMsg('city added to favorits'))
        } catch (err) {
            dispatch(errorMsg(err))
        }
    }
    const onDeleteCity = () => {
        try {
            weatherService.removeCity(cityId)
            dispatch(errorMsg('city removed'))
        } catch (err) {
            dispatch(errorMsg(err))
        }
    }
    const isFavorit = () => {
        if (!favorits || favorits.length === 0) return false
        return favorits.some(city => {
            cityId = city._id
            return city.cityKey === cityKey
        })
    }
    const onCloseModal = () => {
        dispatch(errorMsg(''))
    }
    return (
        <section>
            {/*} <CitySearch onSearch={onSearch} onGetCityForecast={onGetCityForecast} />
            <Weather />*/}


            <section className="main-layout">
                <div className={`forecast-page ${isDarkMode()} flex column justify-center align-center`}>

                    <CitySearch onSearch={onSearch} onGetCityForecast={onGetCityForecast} />
                    {cityName && <h1>{cityName}</h1>}
                    {currentForecast && <span>{currentForecast.WeatherText}</span>}
                    {/*}  <span><img src={process.env.PUBLIC_URL + `/images/${currentForecast.WeatherIcon}.png`} alt="current condition icon" /></span>*/}
                    {/*{forecast && <span className="current-temp">{getTemp()}{degree}</span>}*/}
                    {forecast && <Weather forecast={forecast}
                        isDarkMode={isDarkMode} degree={degree} darkMod={darkMod} />}
                    {isFavorit() ? <button className="btn-remove-from-favorit"
                        onClick={onDeleteCity}>delete city from favorits</button>
                        : <button className="btn-add-to-favorit"
                            onClick={() => onAddToFavorits()}>add to favorit cities</button>}
                </div>
                {error && <Modal msg={error} onCloseModal={onCloseModal} />}
            </section>
        </section>
    )
}