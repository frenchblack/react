import {Cookies} from 'react-cookie'

const cookies = new Cookies()

export const setCookie = (name, value, options)=> {
	return cookies.set(name, value, {...options});
}

export const getCookie = (name)=> {
	return cookies.get(name);
}

export const removeCookie = (name, options) => {
	return cookies.remove(name, {...options});
}

export const setCookieAccessToken = (token) => {
	setCookie("Authorization", `Bearer ${token}`, { maxAge : 30 * 60 }); //httpOnly : true
}

export const setCookieRefreshToken = (token) => {
	setCookie("Refresh", `Bearer ${token}`, { maxAge : 30 * 24 * 60 * 60 }); //httpOnly : true
}