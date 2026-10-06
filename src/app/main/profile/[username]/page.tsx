"use client";

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useInView } from 'react-intersection-observer';
import { IoPersonAddSharp } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaCheck, FaUserEdit, FaMapMarkerAlt } from 'react-icons/fa';

import {
  useGetProfileByUsername,
  useErrorToast,
  useGetFollowData,
  useFollow,
  useGetReport,
} from '@/hooks';
import { Button, ErrorSection, Loading } from '@/components';
import StaticMap from '@/components/UI/StaticMap';
import {
  getErrorResponseMessage,
  getImageURL,
  isInternalServerError,
  isNotFoundError,
} from '@/utils';
import { useConfirmationModalStore, useUserProfileStore } from '@/stores';
import { IReport } from '@/types';
import { Skeleton } from './components';

const ProfileReportCard = ({
  report,
  ownerName,
  ownerPicture,
}: {
  report: IReport;
  ownerName: string;
  ownerPicture: string;
}) => {
  const router = useRouter();
  const t = useTranslations('report');

  const locationText =
    report.location.detailLocation || report.location.displayName;

  return (
    <div className="bg-white backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <div onClick={() => router.push(`/main/reports/${report.id}`)}>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                <Image
                  src={ownerPicture}
                  alt={ownerName}
                  width={32}
                  height={32}
                  className="object-cover h-full w-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-gray-900 truncate">
                  {ownerName}
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1 min-w-0">
                  <FaMapMarkerAlt className="text-primary shrink-0" />
                  <span className="truncate">{locationText}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-[10px] font-bold text-primary rounded-full">
                {t(`report_types.${report.reportType}`)}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-[10px] font-medium text-gray-600 rounded-full">
                {t(`report_card.report_information.status_labels.${report.reportStatus}`)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 pb-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1">
            {report.reportTitle}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 break-words">
            {report.reportDescription}
          </p>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="relative w-full h-[230px] overflow-hidden bg-gray-100 rounded-lg shadow-sm">
          <StaticMap
            key={`profile-map-${report.id}`}
            latitude={report.location.latitude}
            longitude={report.location.longitude}
            height={230}
            zoom={report.location.mapZoom || 15}
            markerColor="red"
            popupText={report.reportTitle}
          />
        </div>
      </div>
    </div>
  );
};

const ProfileStat = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: number;
  isLoading: boolean;
}) => (
  <div className="flex flex-col items-center text-center gap-1 min-w-16">
    <span className="text-gray-600 text-xs sm:text-sm lg:text-base">{label}</span>
    <span className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">
      {isLoading ? (
        <span className="flex items-center justify-center pt-2">
          <Loading type="dots" size="sm" variant="primary" />
        </span>
      ) : (
        value.toLocaleString()
      )}
    </span>
  </div>
);

const ProfilePageByUsername = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('profile_username');

  const username = Array.isArray(params.username) ? params.username[0] : params.username;

  const currentUser = useUserProfileStore((state) => state.userProfile);
  const openConfirm = useConfirmationModalStore((state) => state.openConfirm);

  const {
    isPending: isFetchingUser,
    isError: isErrorFetchingUser,
    error: errorFetchingUser,
    refetch: refetchUser,
    data: userData,
  } = useGetProfileByUsername(username || '');

  const userID = Number(userData?.data?.userID) || 0;

  const {
    isPending: isFetchingFollowData,
    isError: isErrorFetchingFollowData,
    error: errorFetchingFollowData,
    data: followData,
  } = useGetFollowData(userID, 'user');

  const {
    mutate: followMutate,
    isError: isFollowError,
    error: followError,
    isPending: isFollowPending,
  } = useFollow(userID, 'user');

  const followersCount = followData?.data?.followersCount || 0;
  const followingCount = followData?.data?.followingCount || 0;
  const isFollowed = Boolean(followData?.data?.myFollowData);
  const isMyProfile = userData?.data?.userID === currentUser?.userID;

  useErrorToast(isErrorFetchingFollowData, errorFetchingFollowData || t('errors.follow_data_failed'));
  useErrorToast(isFollowError, followError || t('errors.follow_action_failed'));

  const {
    data: profileReports,
    isPending: isFetchingProfileReports,
    isError: isErrorFetchingProfileReports,
    hasNextPage: hasNextProfileReportsPage,
    fetchNextPage: fetchNextProfileReportsPage,
    isFetchingNextPage: isFetchingNextProfileReportsPage,
  } = useGetReport(
    undefined,
    undefined,
    'latest',
    undefined,
    undefined,
    userID || undefined,
    Boolean(userID),
  );

  const reports =
    profileReports?.pages.flatMap((page) => page.data?.reports.reports ?? []) ?? [];

  const { ref, inView } = useInView({
    threshold: 0,
  });
  const hasFetchedForCurrentView = useRef(false);

  useEffect(() => {
    if (!inView) {
      hasFetchedForCurrentView.current = false;
      return;
    }

    if (
      !hasFetchedForCurrentView.current &&
      hasNextProfileReportsPage &&
      !isFetchingNextProfileReportsPage
    ) {
      hasFetchedForCurrentView.current = true;
        fetchNextProfileReportsPage();
    }
  }, [
    inView,
    hasNextProfileReportsPage,
    fetchNextProfileReportsPage,
    isFetchingNextProfileReportsPage,
  ]);

  const handleFollowToggle = () => {
    const modalKey = isFollowed ? 'unfollow_modal' : 'follow_modal';

    openConfirm({
      type: isFollowed ? 'warning' : 'info',
      title: t(`${modalKey}.title`),
      subtitle: t(`${modalKey}.subtitle`),
      description: t(`${modalKey}.description`),
      confirmTitle: t(`${modalKey}.confirm`),
      isPending: isFollowPending,
      onConfirm: () => followMutate(),
    });
  };

  if (isErrorFetchingUser) {
    const message = getErrorResponseMessage(errorFetchingUser);

    return (
      <ErrorSection
        errors={message}
        message={message}
        onGoBack={() => router.back()}
        onGoHome={() => router.push('/main/home')}
        onRetry={() => refetchUser()}
        showBackButton={isNotFoundError(errorFetchingUser)}
        showHomeButton={isNotFoundError(errorFetchingUser)}
        showRetryButton={isInternalServerError(errorFetchingUser)}
      />
    );
  }

  if (isFetchingUser) {
    return <Skeleton />;
  }

  const fullName = userData?.data?.fullName || t('defaults.full_name');
  const displayUsername = userData?.data?.username || username || t('defaults.username');
  const profilePicture =
    getImageURL(userData?.data?.profilePicture || '', 'user') || '/default-profile.png';
  const isPro = false;

  const actionButtonBase =
    'px-4 py-2 rounded-lg font-medium text-sm sm:text-base border-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden mt-8 min-h-screen pb-12">

      <div className="h-24 sm:h-32 lg:h-48 bg-primary" />

      <header className="px-4 md:px-10 pb-6">
        <div className="-mt-12 sm:-mt-16 md:-mt-20 flex items-end justify-between gap-4">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden ring-4 sm:ring-6 md:ring-8 ring-white shadow-2xl bg-gray-200 shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-56 lg:h-56">
            <Image
              src={profilePicture}
              alt={fullName}
              width={232}
              height={232}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          <div className="flex gap-4 sm:gap-6 lg:gap-10 pb-2">
            <ProfileStat
              label={t('stats.followers')}
              value={followersCount}
              isLoading={isFetchingFollowData}
            />
            <ProfileStat
              label={t('stats.following')}
              value={followingCount}
              isLoading={isFetchingFollowData}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 wrap-break-word">
                {displayUsername}
              </h1>
              {isPro && (
                <span className="bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                  {t('pro_badge')}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm sm:text-base wrap-break-word">{fullName}</p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            {isMyProfile ? (
              <Button
                onClick={() => router.push('/main/settings/profile')}
                icon={<FaUserEdit />}
                className={`${actionButtonBase} bg-primary text-white border-primary hover:bg-primary/80`}
              >
                {t('actions.edit_profile')}
              </Button>
            ) : (
              <Button
                onClick={handleFollowToggle}
                disabled={isFollowPending}
                icon={isFollowed ? <FaCheck /> : <IoPersonAddSharp />}
                className={`${actionButtonBase} ${
                  isFollowed
                    ? 'bg-white text-gray-900 border-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900'
                    : 'bg-primary text-white border-primary hover:bg-primary/80'
                }`}
              >
                {isFollowed ? t('actions.following') : t('actions.follow')}
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="px-4 md:px-10 pt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('reports.title')}</h2>

        {isFetchingProfileReports ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((item) => (
              <div key={item} className="h-[260px] rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : isErrorFetchingProfileReports ? (
          <p className="text-sm text-gray-500 py-8 text-center">{t('reports.error')}</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">{t('reports.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports.map((report) => (
              <ProfileReportCard
                key={report.id}
                report={report}
                ownerName={displayUsername}
                ownerPicture={profilePicture}
              />
            ))}
          </div>
        )}

        {hasNextProfileReportsPage && (
          <div ref={ref} className="flex justify-center mt-6">
            {isFetchingNextProfileReportsPage && (
              <div className="flex items-center space-x-2 text-primary/70 w-full justify-center">
                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                <span>{t('reports.loading_more')}</span>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePageByUsername;