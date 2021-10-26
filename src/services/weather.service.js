import { storageService } from './storageService.js'
import { utilService } from './utilService.js'

export const weatherService = {
    saveCity,
    removeCity,
    loadCities,
    searchCityByCityKey,
    searchCityAutoComplete,
    getCityCurrentCondition,
    get5DayForeCast,
}

const STORAGE_KEY = 'city'
const API_KEY = 'ihZXkNFX7bmJkGgBSsc3iSA5YjBGKvy0'
const gCitys = []


async function saveCity(cityKey, cityName) {
    try {
        const cityCurrentCondition = await weatherService.getCityCurrentCondition(cityKey)
        const cityToSave = {
            _id: utilService.makeId(),
            name: cityName,
            cityCurrentCondition,
            cityKey
        }
        gCitys.push(cityToSave)
        storageService.saveToStorage(STORAGE_KEY, gCitys)
        return Promise.resolve(cityToSave);
    } catch (err) {
        const msg = err
        return Promise.reject(msg)
    }
}

function removeCity(cityId) {
    try {
        const idx = gCitys.findIndex(city => city._id === cityId)
        gCitys.splice(idx, 1)
        storageService.saveToStorage(STORAGE_KEY, gCitys)
        return Promise.resolve();
    } catch (err) {
        const msg = err
        throw new Error(msg)
    }
}

function loadCities() {
    try {
        const cities = storageService.loadFromStorage(STORAGE_KEY)||[]
        return cities;
    } catch (err) {
        const msg = err
        throw new Error(msg)
    }
}
async function searchCityAutoComplete(searchTerm) {
    try {
        let response = await fetch(`http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${API_KEY}&q=${searchTerm}`)
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const cities = await response.json()
        return cities
    } catch (err) {
        const msg = (err.message);
        Promise.reject(msg)
    }
}
async function searchCityByCityKey(cityKey) {
    try {
        let response = await fetch(`http://dataservice.accuweather.com/locations/v1/${cityKey}?apikey=${API_KEY}`)
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const city = await response.json()
        return city
    } catch (err) {
        const msg = (err.message)
        Promise.reject(msg)
    }
}

async function getCityCurrentCondition(cityKey) {
    try {
        let response = await fetch(`http://dataservice.accuweather.com/currentconditions/v1/${cityKey}?apikey=${API_KEY}&details=false`)
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const correntCondition = await response.json()
        return correntCondition
    } catch (err) {
        const msg = (err.message)
        Promise.reject(msg);
    }
}

async function get5DayForeCast(cityKey, isC) {
    try {
        let response = await fetch(`http://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityKey}?apikey=${API_KEY}&metric=${metric()}`)
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const forecast5day = await response.json()
        return forecast5day
    } catch (err) {
        const msg = (err.message)
        Promise.reject(msg);
    }
}