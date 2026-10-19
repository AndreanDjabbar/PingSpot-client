"use client";

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiX } from 'react-icons/bi';
import { useInView } from 'react-intersection-observer';

import { useGetUserConnectionsFollowers, useGetUserConnectionsFollowing } from '@/hooks';
import { getImageURL } from '@/utils';
import { Scrollbar } from '@/components';

interface ProfileConnectionsModalProps {
  userID: number;
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileConnectionsModal = ({
  userID,
  username,
  isOpen,
  onClose,
}: ProfileConnectionsModalProps) => {
  const router = useRouter();
  const t = useTranslations('profile_username.connections_modal');
  const [viewMode, setViewMode] = useState<'followers' | 'following'>('followers');
  const { ref, inView } = useInView({ threshold: 0 });

  const followersQuery = useGetUserConnectionsFollowers(isOpen ? userID : 0);
  const followingQuery = useGetUserConnectionsFollowing(isOpen ? userID : 0);

  const followers = useMemo(
    () => followersQuery.data?.pages.flatMap((page) => page.data?.followers ?? []) ?? [],
    [followersQuery.data],
  );
  const following = useMemo(
    () => followingQuery.data?.pages.flatMap((page) => page.data?.following ?? []) ?? [],
    [followingQuery.data],
  );

  const isFollowers = viewMode === 'followers';
  const connections = isFollowers ? followers : following;
  const activeQuery = isFollowers ? followersQuery : followingQuery;

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && inView && activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  }, [activeQuery, inView, isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connections-modal-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div className="min-w-0">
            <h2 id="connections-modal-title" className="truncate text-lg font-bold text-gray-900">
              {t('title')}
            </h2>
            <p className="truncate text-sm text-gray-500">@{username}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            aria-label={t('close')}
          >
            <BiX size={26} />
          </button>
        </div>

        <div className="border-b border-gray-200 p-5 pb-4">
          <div className="inline-flex w-full overflow-hidden rounded-lg shadow-sm">
            {(['followers', 'following'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === mode
                    ? 'bg-gray-400 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t(`tabs.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 px-5">
          <Scrollbar height="min(50vh, 360px)">
            {activeQuery.isPending ? (
              <div className="space-y-4 py-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex animate-pulse items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                      <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeQuery.isError ? (
              <div className="py-10 text-center">
                <p className="mb-3 text-sm text-gray-500">{t('error')}</p>
                <button
                  type="button"
                  onClick={() => activeQuery.refetch()}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {t('retry')}
                </button>
              </div>
            ) : connections.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                {t(`empty.${viewMode}`)}
              </p>
            ) : (
              <div className="space-y-3 py-5">
                {connections.map((connection) => (
                  <button
                    type="button"
                    key={`${viewMode}-${connection.userID}`}
                    onClick={() => {
                      onClose();
                      router.push(`/profile/${connection.username}`);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="relative h-10 w-10 shrink-0">
                      {connection.profilePicture ? (
                        <Image
                          src={getImageURL(connection.profilePicture, 'user')}
                          alt={connection.username}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-indigo-500 text-sm font-semibold text-white">
                          {connection.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          connection.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {connection.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {connection.status === 'online' ? t('status.online') : t('status.offline')}
                      </p>
                    </div>
                  </button>
                ))}

                {activeQuery.hasNextPage && (
                  <div ref={ref} className="flex justify-center py-3">
                    {activeQuery.isFetchingNextPage && (
                      <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-primary/70" />
                    )}
                  </div>
                )}
              </div>
            )}
          </Scrollbar>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProfileConnectionsModal;