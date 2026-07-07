import type { SupportedLocale } from '@/i18n/locales'
import type { SportsVertical } from '@/lib/sports-vertical'
import { cacheTag } from 'next/cache'
import SportsGamesCenter from '@/app/[locale]/(platform)/sports/_components/SportsGamesCenter'
import { buildSportsGamesCards } from '@/app/[locale]/(platform)/sports/_utils/sports-games-data'
import { cacheTags } from '@/lib/cache-tags'
import { EventRepository } from '@/lib/db/queries/event'
import { SportsMenuRepository } from '@/lib/db/queries/sports-menu'

type SportsFeedPageMode = 'liveAndSoon' | 'soon'

interface SportsFeedPageContentProps {
  locale: SupportedLocale
  pageMode: SportsFeedPageMode
  sportSlug: string
  sportTitle: string
  vertical: SportsVertical
}

async function loadSportsFeedPageData({
  locale,
  vertical,
}: {
  locale: SupportedLocale
  vertical: SportsVertical
}) {
  'use cache'
  cacheTag(cacheTags.eventsList, cacheTags.sportsMenu)

  const [{ data: events }, { data: layoutData }] = await Promise.all([
    EventRepository.listEvents({
      tag: vertical,
      sportsVertical: vertical,
      search: '',
      userId: '',
      bookmarked: false,
      status: 'active',
      locale,
      sportsSection: 'games',
      excludeSportsAuxiliary: true,
    }),
    SportsMenuRepository.getLayoutData(vertical),
  ])

  return {
    cards: buildSportsGamesCards(events ?? []),
    categoryTitleBySlug: layoutData?.h1TitleBySlug ?? {},
  }
}

export default async function SportsFeedPageContent({
  locale,
  pageMode,
  sportSlug,
  sportTitle,
  vertical,
}: SportsFeedPageContentProps) {
  const { cards, categoryTitleBySlug } = await loadSportsFeedPageData({
    locale,
    vertical,
  })

  return (
    <div key={`${vertical}-${sportSlug}-page`} className="contents">
      <SportsGamesCenter
        cards={cards}
        sportSlug={sportSlug}
        sportTitle={sportTitle}
        pageMode={pageMode}
        categoryTitleBySlug={categoryTitleBySlug}
        vertical={vertical}
      />
    </div>
  )
}
