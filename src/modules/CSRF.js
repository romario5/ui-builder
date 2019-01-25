/**
 * Allows to library use CSRF token.
 * If CSRF token is set it will be sent via AJAX requests.
 */

export let csrfParam = 'csrf';
export let csrfToken = null;


/**
 * Token can be set as single string or as an object.
 * In case if token set as string it will be assigned into the 
 * [csrfToken] variable, that is private inside wrapping function (IIFE).
 * If token is presented as an object then the name of the first property 
 * will be used as token parameter name and the value as the token.
 * Token parameter name is used on sending CSRF token to the server using 
 * AJAX queries for example.
 */
export function setCsrfToken(token){
	if(csrfToken === null){
		if(typeof token === 'object'){
			csrfParam = Object.keys(token)[0];
			csrfToken = token[csrfParam];
		}else if(typeof token === 'string'){
			csrfToken = token;
		}
	}
}