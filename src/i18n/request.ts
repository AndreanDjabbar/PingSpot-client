import { getRequestConfig, getLocale } from 'next-intl/server';


export default getRequestConfig(async () => {
    const locale = await getLocale();
    const defaultLocale = 'id';

    return {
        locale : locale || defaultLocale,
        messages: (await import(`../dictionaries/${locale}.json`)).default,
    };
});