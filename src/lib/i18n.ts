import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const getLocal = async () => {
    const defaultLocale = 'id';
    const supportedLocales = ['id', 'en'];

    const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value;
    const resolvedLocale = supportedLocales.includes(cookieLocale ?? '')
        ? cookieLocale!
        : defaultLocale;

    return {
        locale: resolvedLocale,
        messages: (await import(`../dictionaries/${resolvedLocale}.json`)).default,
    };
};

export default getRequestConfig(getLocal);