'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

import { LucideIcon } from '@/lib/lucide-icon'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PagingProvider, usePaging, Paging } from '@/components/paging'

import { EditLink } from './components/edit-link'
import { ViewLink } from './components/view-link'
import { TrashButton } from './components/trash-button'
import { RestoreButton } from './components/restore-button'
import { DeleteButton } from './components/delete-button'

import { cn, getMeta } from '@/lib/utils'
import { Post, PostStatus } from '@/types/database'
import { useAuth } from '@/hooks/use-auth'
import { useQueryString } from '@/hooks/use-query-string'
import { usePostsAPI, useCountPostsAPI } from '@/queries/client/posts'

const PostList = () => {
  const searchParams = useSearchParams()
  const page = +(searchParams.get('page') ?? '1')
  const perPage = +(searchParams.get('perPage') ?? '10')
  const pageSize = +(searchParams.get('pageSize') ?? '10')
  const status = searchParams.get('status') ?? undefined

  const { user } = useAuth()
  const { count } = usePostsAPI(user?.id ?? null, {
    page,
    perPage,
    status,
  })

  const total = count ?? 0

  return (
    <PagingProvider value={{ total, page, perPage, pageSize, status }}>
      <Header />
      <Body />
      <Footer />
    </PagingProvider>
  )
}

const Header = () => {
  const { user } = useAuth()
  const { data, count } = useCountPostsAPI(user?.id ?? null)

  const status: Record<string, number> | undefined = React.useMemo(() => {
    return data?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.status] = curr.count
      return acc
    }, {})
  }, [data])

  return (
    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
      <HeadLink status={undefined} label="all" count={count ?? 0} />
      <span>|</span>
      <HeadLink status="publish" label="publish" count={status?.publish ?? 0} />
      <span>|</span>
      <HeadLink status="future" label="future" count={status?.future ?? 0} />
      <span>|</span>
      <HeadLink status="draft" label="draft" count={status?.draft ?? 0} />
      {/* <span>|</span> */}
      {/* <HeadLink status="pending" label="pending" count={status?.pending ?? 0} /> */}
      <span>|</span>
      <HeadLink status="private" label="private" count={status?.private ?? 0} />
      <span>|</span>
      <HeadLink status="trash" label="trash" count={status?.trash ?? 0} />
    </div>
  )
}

interface HeadLinkProps {
  status?: PostStatus
  label: PostStatus | 'all'
  count: number
}

const HeadLink = (props: HeadLinkProps) => {
  const { status, label, count } = props

  const { t } = useTranslation()
  const { status: current } = usePaging()
  const { qs } = useQueryString()
  const pathname = usePathname()

  return (
    <Link
      href={pathname + '?' + qs({ status, page: 1 })}
      className={cn(
        'h-auto p-0',
        current === status ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {t(`PostStatus.${label}`)}({count})
    </Link>
  )
}

const Footer = () => {
  const { user } = useAuth()
  const { page, perPage, status } = usePaging()
  const { posts } = usePostsAPI(user?.id ?? null, {
    page,
    perPage,
    status,
  })

  if (!posts) return null

  return <Paging />
}

const Body = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { page, perPage, status } = usePaging()
  const { posts } = usePostsAPI(user?.id ?? null, {
    page,
    perPage,
    status,
  })

  return (
    <Table>
      <TableCaption></TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox />
          </TableHead>
          <TableHead className="w-[70px] text-center">
            {t('Table.num')}
          </TableHead>
          <TableHead>{t('Table.title')}</TableHead>
          <TableHead className="w-[120px] text-center">
            {t('Table.author')}
          </TableHead>
          <TableHead className="w-[70px] text-center">
            {t('Table.visibility')}
          </TableHead>
          <TableHead className="w-[100px] text-center">
            {t('Table.views')}
          </TableHead>
          <TableHead className="w-[200px] text-center">
            {t('Table.created_at')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts === null ? (
          <LoadingItem />
        ) : posts?.length > 0 ? (
          posts?.map((post: Post) => <PostItem key={post?.id} post={post} />)
        ) : (
          <EmptyItem />
        )}
      </TableBody>
    </Table>
  )
}

interface PostItemProps {
  post: Post
}

const PostItem = (props: PostItemProps) => {
  const { post } = props
  const { t } = useTranslation()
  const { status } = usePaging()

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell align="center">{post?.num}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className="line-clamp-1">
            <span>
              {!status && post?.status !== 'publish'
                ? `[${t(`PostStatus.${post?.status}`)}] `
                : null}
            </span>
            <span className="break-all">{post?.title}</span>
          </div>
          {dayjs().isBefore(dayjs(post?.created_at).add(1, 'day')) ? (
            <Badge variant="destructive" className="text-2xs rounded-none px-1">
              N
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center space-x-1">
          {post?.status === 'publish' || post?.status === 'private' ? (
            <>
              <EditLink post={post} />
              <span>|</span>
              <TrashButton post={post} />
              <span>|</span>
              <ViewLink post={post} />
            </>
          ) : post?.status === 'trash' ? (
            <>
              <RestoreButton post={post} />
              <span>|</span>
              <DeleteButton post={post} />
            </>
          ) : (
            <>
              <EditLink post={post} />
              <span>|</span>
              <TrashButton post={post} />
            </>
          )}
        </div>
      </TableCell>
      <TableCell align="center">{post?.author?.full_name}</TableCell>
      <TableCell align="center">
        {getMeta(post?.meta, 'visibility', null) === 'private' ? (
          <LucideIcon name="LockKeyhole" className="size-4 min-w-4" />
        ) : (
          <LucideIcon name="LockKeyholeOpen" className="size-4 min-w-4" />
        )}
      </TableCell>
      <TableCell align="center">
        {getMeta(post?.meta, 'view_count', '0')?.toLocaleString()}
      </TableCell>
      <TableCell align="center">
        {dayjs(post?.created_at).format('YYYY-MM-DD HH:mm:ss')}
      </TableCell>
    </TableRow>
  )
}

const EmptyItem = () => {
  const { t } = useTranslation()

  return (
    <TableRow className="hover:bg-inherit">
      <TableCell colSpan={6} align="center">
        {t('Table.empty_post')}
      </TableCell>
    </TableRow>
  )
}

const LoadingItem = () => {
  const { t } = useTranslation()

  return (
    <TableRow className="hover:bg-inherit">
      <TableCell colSpan={5} align="center">
        {t('Table.is_loading')}
      </TableCell>
    </TableRow>
  )
}

export { PostList }
