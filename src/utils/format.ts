import { format, Locale } from "date-fns";
import { id } from "date-fns/locale";

type FormatDateOptions = {
    formatStr?: string;
    locale?: Locale;
    withTime?: boolean;
};

type RelativeTimeTranslator = (
    key: string,
    values?: Record<string, string | number>
) => string;

export const getFormattedDate = (
    value: string | number,
    options: FormatDateOptions = {}
): string => {
    if (!value) return "";

    const {
        formatStr,
        locale = id,
        withTime = false,
    } = options;

    const defaultFormat = withTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd";
    const fmt = formatStr || defaultFormat;

    let date: Date;

    if (typeof value === "number") {
        date = value < 1e12 ? new Date(value * 1000) : new Date(value);
    } else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) return "";

    return format(date, fmt, { locale });
};

export const getRelativeTime = (
    dateString: string,
    translate?: RelativeTimeTranslator
): string => {
    const fallback = (key: string, count?: number): string => {
        if (key === 'just_now') return 'Baru saja';
        if (key === 'unknown') return 'Tidak diketahui';

        const units: Record<string, string> = {
            minutes_ago: 'menit yang lalu',
            hours_ago: 'jam yang lalu',
            days_ago: 'hari yang lalu',
            weeks_ago: 'minggu yang lalu',
            months_ago: 'bulan yang lalu',
        };

        return `${count} ${units[key]}`;
    };

    const formatRelativeTime = (key: string, count?: number): string => (
        translate ? translate(key, count === undefined ? undefined : { count }) : fallback(key, count)
    );

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return formatRelativeTime('unknown');

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return formatRelativeTime('just_now');
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return formatRelativeTime('minutes_ago', diffInMinutes);
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return formatRelativeTime('hours_ago', diffInHours);
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return formatRelativeTime('days_ago', diffInDays);
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return formatRelativeTime('weeks_ago', diffInWeeks);
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        return formatRelativeTime('months_ago', diffInMonths);
    } catch {
        return formatRelativeTime('unknown');
    }
};
