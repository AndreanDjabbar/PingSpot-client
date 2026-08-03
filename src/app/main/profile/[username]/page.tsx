"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetProfileByUsername, useErrorToast, useGetFollowData, useFollow } from '@/hooks';
import { Button, ErrorSection, Loading } from '@/components';
import { getErrorResponseMessage, getImageURL, isInternalServerError, isNotFoundError } from '@/utils';
import { Skeleton } from './components';
import { IoPersonAddSharp } from 'react-icons/io5';
import { FaCheck, FaUserEdit } from 'react-icons/fa';
import { BiSolidMessageRounded } from 'react-icons/bi';
import { useConfirmationModalStore, useUserProfileStore } from '@/stores';

const ProfilePageByUsername = () => {
  const params = useParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const router = useRouter();
  const currentUserData = useUserProfileStore((state) => state.userProfile);
  const openConfirm = useConfirmationModalStore((s) => s.openConfirm);

  const {
    isPending: isFetchingUser,
    isError: isErrorFetchingUser,
    error: errorFetchingUser,
    refetch: refetchUser,
    data: userData
  } = useGetProfileByUsername(username || '');

  const userID = userData?.data?.userID || 0;

  const {
    isPending: isFetchingFollowData,
    isError: isErrorFetchingFollowData,
    error: errorFetchingFollowData,
    refetch: refetchFollowData,
    data: followData
  } = useGetFollowData(Number(userID) || 0, 'user');

  const {
    mutate: followMutate,
    isError: isFollowError,
    error: followError,
    isPending: isFollowPending,
  } = useFollow(Number(userID) || 0, 'user');

  const followingCount = followData?.data?.followingCount || 0;
  const followersCount = followData?.data?.followersCount || 0;
  const isFollowed = (followData?.data?.myFollowData == null) ? false : true;
  const isMyProfile = userData?.data?.userID === currentUserData?.userID;

  const handleFollowConfirmationModal = () => {
    openConfirm({
        type: "info",
        title: "Konfirmasi Mengikuti",
        subtitle: "Apakah Anda yakin ingin mengikuti pengguna ini?",
        isPending: isFollowPending || false,
        description: "Dengan mengikuti pengguna ini, Anda akan menerima pemberitahuan saat mereka melakukan aktivitas terbaru.",
        confirmTitle: "Ya, Ikuti",
        onConfirm: () => handleFollowClick(),
    });
  }
  
  const handleUnfollowConfirmationModal = () => {
    openConfirm({
        type: "warning",
        title: "Konfirmasi Berhenti Mengikuti",
        subtitle: "Apakah Anda yakin ingin berhenti mengikuti pengguna ini?",
        isPending: isFollowPending || false,
        description: "Dengan berhenti mengikuti pengguna ini, Anda tidak akan lagi menerima pemberitahuan tentang aktivitas terbaru mereka.",
        confirmTitle: "Ya, Berhenti Mengikuti",
        onConfirm: () => handleFollowClick(),
    });
  }

  const userProfile = {
    fullName: userData?.data?.fullName || "User's full name",
    username: userData?.data?.username || username || "username",
    title: "Interface and Brand Designer",
    location: "San Antonio",
    profilePicture: getImageURL(userData?.data?.profilePicture || '', "user") || "/default-profile.png",
    isPro: false,
    followers: followersCount,
    following: followingCount,
    likes: 548,
  };

  useErrorToast(isErrorFetchingFollowData, errorFetchingFollowData || "Gagal memuat data follow.");
  useErrorToast(isFollowError, followError || "Gagal melakukan follow/unfollow.");

  const handleFollowClick = () => {
    followMutate();
  };

  if (isErrorFetchingUser) {
    const isNotFound = isNotFoundError(errorFetchingUser);
    const isServerError = isInternalServerError(errorFetchingUser);

    return (
      <ErrorSection
        errors={getErrorResponseMessage(errorFetchingUser)}
        message={getErrorResponseMessage(errorFetchingUser)}
        onGoBack={() => router.back()}
        onGoHome={() => router.push("/main/home")}
        onRetry={() => refetchUser()}
        showBackButton={isNotFound}
        showHomeButton={isNotFound}
        showRetryButton={isServerError}
      />
    );
  }

  if (isFetchingUser) {
    return (
      <Skeleton></Skeleton>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden relative pb-50 mt-8 h-screen">
      <div className="h-24 sm:h-32 md:h-33 lg:h-48 bg-pingspot relative">
        <div className="absolute inset-0 bg-primary to-transparent"></div>
      </div>

      <div className="absolute top-14 left-4 md:left-10 flex flex-col md:flex-row items-center ">
        <div className='flex items-center gap-25 sm:gap-35'>
          <div>
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden ring-4 sm:ring-6 md:ring-8 ring-white shadow-2xl w-24 h-24 sm:w-30 sm:h-30 md:w-40 md:h-40 lg:w-58 lg:h-58 bg-gray-200">
              <Image
                src={userProfile.profilePicture}
                alt={userProfile.fullName || "Profile picture"}
                className="object-cover w-full h-full"
                width={232}
                height={232}
                priority
              />
            </div>
            <div className='md:hidden block'>
              <div className='flex flex-col items-start mt-2 '>
                <div className="flex items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 max-w-50 break-words">
                    {userProfile.username}
                  </h1>
                  {userProfile.isPro && (
                    <span className="bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                      PRO ✦
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm sm:text-base md:text-md mb-1 max-w-50 break-words">
                  {userProfile.fullName}
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center sm:pt-20 pt-10 md:hidden'>
            <div className="gap-4 sm:gap-6 md:gap-8 md:hidden">
              <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="text-gray-600 text-xs sm:text-sm md:text-md">Pengikut</div>
                  <div className="text-sm sm:text-base md:text-md font-bold text-gray-900">
                    {isFetchingFollowData ? (
                      <div className='flex items-center justify-center pt-2'>
                        <Loading
                        type='dots'
                        size='sm'
                        variant='primary'
                        />
                      </div>
                    ) : (
                      userProfile.followers.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="text-gray-600 text-xs sm:text-sm md:text-md">Mengikuti</div>
                  <div className="text-sm sm:text-base md:text-md font-bold text-gray-900">
                    {isFetchingFollowData ? (
                      <div className='flex items-center justify-center pt-2'>
                        <Loading
                        type='dots'
                        size='sm'
                        variant='primary'
                        />
                      </div>
                    ) : (
                      userProfile.following
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-2 text-xs sm:text-sm md:text-base md:flex">
              {!isMyProfile ? (
                <>
                  <Button
                  onClick={isFollowed ? handleUnfollowConfirmationModal : handleFollowConfirmationModal}
                    disabled={isFollowPending}
                    icon={isFollowed ? <FaCheck /> : <IoPersonAddSharp />}
                    className={
                      isFollowed
                        ? "bg-white text-gray-900 px-3 sm:px-4 py-2 sm:py-2 rounded-lg font-medium border-2 border-gray-900 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-900"
                        : "bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    }>
                      {isFollowed ? 'Diikuti' : 'Ikuti'}
                  </Button>
                  <Button className="bg-white text-gray-900 py-2 sm:py-2 px-3 sm:px-4 rounded-lg font-medium border-2 border-gray-900 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <BiSolidMessageRounded size={20} />
                  </Button>
                </>
              ) : (
                <Button
                    onClick={() => router.push('/main/settings/profile')}
                    icon={<FaUserEdit />}
                    className={"bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    }>
                      Edit Profil
                  </Button>
              )}
            </div>
          </div>
        </div>

        <div className='md:pt-20 lg:pt-35 ml-3 flex items-center justify-between w-full md:gap-15 lg:gap-25 xl:gap-100'>
          <div className='hidden md:block '>
            <div className='flex flex-col items-start mt-2 '>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 max-w-80 block-truncate break-words">
                  {userProfile.username}
                </h1>
                {userProfile.isPro && (
                  <span className="bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                    PRO ✦
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm sm:text-base md:text-md mb-1 max-w-50 break-words">
                {userProfile.fullName}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-2 text-xs sm:text-sm md:text-base md:flex">
              {!isMyProfile ? (
                <>
                  <Button
                    onClick={isFollowed ? handleUnfollowConfirmationModal : handleFollowConfirmationModal}
                    disabled={isFollowPending}
                    icon={isFollowed ? <FaCheck /> : <IoPersonAddSharp />}
                    className={
                      isFollowed
                        ? "bg-white text-gray-900 px-3 sm:px-5 py-1.5 sm:py-4 rounded-lg font-medium border-2 border-gray-900 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-900"
                        : "bg-primary text-white px-3 sm:px-5 py-1.5 sm:py-4 rounded-lg font-medium border-2 border-primary hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    }
                  >
                    {isFollowed ? 'Diikuti' : 'Ikuti'}
                  </Button>
                  <Button 
                  className="bg-white text-gray-900 py-1.5 sm:py-4 px-3 sm:px-5 rounded-lg font-medium border-2 border-gray-900 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    Pesan
                  </Button>
                </>
              ) : (
                <Button
                    onClick={() => router.push('/main/settings/profile')}
                    icon={<FaUserEdit />}
                    className={"bg-primary text-white px-3 sm:px-5 py-1.5 sm:py-4 rounded-lg font-medium border-2 border-primary hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"}
                  >
                    Edit Profil
                  </Button>
              )}
            </div>
          </div>
          <div className="gap-4 sm:gap-6 md:gap-8 hidden md:block">
            <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <div className="flex flex-col items-center text-center gap-1">
                <div className="text-gray-600 text-xs sm:text-sm md:text-md lg:text-xl">Pengikut</div>
                <div className="text-sm sm:text-base md:text-md lg:text-xl  font-bold text-gray-900 ">
                  {isFetchingFollowData ? (
                    <div className='flex items-center justify-center pt-4'>
                      <Loading
                      type='dots'
                      size='sm'
                      variant='primary'
                      />
                    </div>
                  ) : (
                    userProfile.followers.toLocaleString()
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <div className="text-gray-600 text-xs sm:text-sm md:text-md lg:text-xl">Mengikuti</div>
                <div className="text-sm sm:text-base md:text-md font-bold lg:text-xl text-gray-900">
                  {isFetchingFollowData ? (
                      <div className='flex items-center justify-center pt-4'>
                        <Loading
                        type='dots'
                        size='sm'
                        variant='primary'
                        />
                      </div>
                  ) : (
                    userProfile.following.toLocaleString())}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageByUsername;