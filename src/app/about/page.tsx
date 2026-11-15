import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaArrowRight, FaBell, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { PingspotLogo } from "@/components/UI/PingspotLogo";
import { AboutImage } from "@/components/UI/AboutImage";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("about");
    const title = `${t("hero.title")} | PingSpot`;
    const description = t("hero.description");

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
        },
        twitter: {
            card: "summary",
            title,
            description,
        },
    };
}

const AboutPage = async () => {
    const t = await getTranslations("about");
    const featureGroups = [
        {
            key: "reporting",
            images: ["report_detail.png", "update_progress.png", "report_vote.png"],
        },
        {
            key: "community",
            images: ["explore.png", "user_profile.png", "report_comment.png"],
        },
        {
            key: "stay_connected",
            images: ["notification.png", "saved_report.png", "settings.png"],
        },
    ] as const;

    return (
        <main className="h-screen overflow-y-auto bg-background">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                <Link href="/login" aria-label="PingSpot home">
                    <PingspotLogo size={150} variant="full" className="h-15 w-auto sm:h-20" />
                </Link>
                <div className="flex items-center gap-3 text-sm font-semibold">
                    {/* <Link href="/login" className="hidden rounded-lg px-4 py-2 text-surface transition-colors hover:bg-white sm:inline-flex">{t("nav.sign_in")}</Link> */}
                    <Link
                        href="/login"
                        className="rounded-lg bg-primary px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-primary-hover"
                    >
                        {t("nav.get_started")}
                    </Link>
                </div>
            </nav>

            <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-28 lg:pt-16">
                <div className="max-w-2xl">
                    <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {t("eyebrow")}
                    </p>
                    <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-surface sm:text-6xl">
                        {t("hero.title")}
                    </h1>
                    <p className="mt-6 max-w-xl text-base leading-8 text-surface/70 sm:text-lg">
                        {t("hero.description")}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-3 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
                        >
                            {t("hero.cta")}
                            <FaArrowRight className="text-xs" />
                        </Link>
                        <span className="text-sm font-medium text-surface/50">{t("hero.note")}</span>
                    </div>
                </div>
                <div className="relative min-h-90 overflow-hidden rounded-4xl bg-white p-3 shadow-2xl shadow-surface/15 sm:min-h-110 sm:p-4">
                    <AboutImage
                        src="/images/about/report.png"
                        alt={t("hero.image_alt")}
                        priority
                        className="min-h-84 rounded-3xl border-0 bg-background shadow-none"
                    />
                    <div className="absolute inset-x-7 bottom-7 rounded-2xl border border-white/20 bg-surface/75 p-5 text-white backdrop-blur-md sm:inset-x-9 sm:bottom-9 sm:p-6">
                        <p className="text-sm leading-6 text-white/85">{t("hero.quote")}</p>
                        <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                            <span className="h-px w-8 bg-primary" />
                            {t("hero.badge")}
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-muted/60 bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
                            {t("features.eyebrow")}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface sm:text-4xl">
                            {t("features.title")}
                        </h2>
                        <p className="mt-4 leading-7 text-surface/65">{t("features.description")}</p>
                    </div>
                    <div className="mt-14 space-y-20 lg:space-y-28">
                        {featureGroups.map(({ key, images }, index) => (
                            <article
                                key={key}
                                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${index % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}
                            >
                                <div>
                                    {/* <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                                        <Icon />
                                    </div> */}
                                    <h3 className="mt-6 text-2xl font-bold tracking-tight text-surface">
                                        {t(`features.${key}.title`)}
                                    </h3>
                                    <p className="mt-4 leading-7 text-surface/65">
                                        {t(`features.${key}.description`)}
                                    </p>
                                    <ul className="mt-6 space-y-3 text-sm font-medium text-surface/75">
                                        {["one", "two", "three"].map((point) => (
                                            <li key={point} className="flex items-start gap-3">
                                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                {t(`features.${key}.points.${point}`)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <AboutImage
                                        src={`/images/about/${images[0]}`}
                                        alt={t(`features.${key}.image_alt`)}
                                        className="col-span-2 aspect-video"
                                    />
                                    <AboutImage
                                        src={`/images/about/${images[1]}`}
                                        alt={t(`features.${key}.image_alt`)}
                                        className="aspect-4/3"
                                    />
                                    <AboutImage
                                        src={`/images/about/${images[2]}`}
                                        alt={t(`features.${key}.image_alt`)}
                                        className="aspect-4/3"
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
                <div className="relative overflow-hidden rounded-3xl bg-surface px-6 py-12 text-white sm:px-12 lg:px-16">
                    <div className="relative z-10 max-w-2xl">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-200">
                            {t("mission.eyebrow")}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            {t("mission.title")}
                        </h2>
                        <p className="mt-4 leading-7 text-white/70">{t("mission.description")}</p>
                        <Link
                            href="/login"
                            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                        >
                            {t("mission.cta")}
                            <FaArrowRight className="text-xs" />
                        </Link>
                    </div>
                    <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-32 border-primary/30" />
                    <div className="absolute -bottom-28 right-24 h-56 w-56 rounded-full border-24 border-cyan-200/10" />
                </div>
            </section>

            <footer className="border-t border-muted/60 px-5 py-6 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-surface/50 sm:flex-row sm:items-center sm:justify-between">
                    <span>{t("footer.tagline")}</span>
                    <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
                </div>
            </footer>
        </main>
    );
};

export default AboutPage;