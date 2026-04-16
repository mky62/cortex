
import * as ct from "countries-and-timezones"

function getCountryForCode(countryCode: string | undefined) {
    if (!countryCode) return null;

    const country = ct.getCountry(countryCode);

    return {
        code: countryCode,
        name: country?.name || ""
    }
}

export function getCountryForTimezone(timezone: string) {

    if ( !timezone) return null;

    const timezoneInfo = ct.getTimezone(timezone);

    if (!timezoneInfo?.countries?.length) return null;

    const countryCode = timezoneInfo.countries[0];

    if (!countryCode) return null;

    return getCountryForCode(countryCode);
}

export function getCountryForLocale(locale: string | undefined) {
    if (!locale) return null;

    try {
        return getCountryForCode(new Intl.Locale(locale).region);
    } catch {
        return null;
    }
}

export function getCountryFlag(countryCode: string) {
    const normalizedCountryCode = countryCode.trim().toLowerCase();

    if (!/^[a-z]{2}$/.test(normalizedCountryCode)) {
        return null;
    }

    return `https://flagcdn.com/w40/${normalizedCountryCode}.png`
}
