'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { getMeta } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { usePostViewsAPI, usePostsAPI } from '@/queries/client/posts'
import { Post } from '@/types/database'

interface PostViewsProps extends React.HTMLAttributes<HTMLDivElement> {}

const PostViews = (props: PostViewsProps) => {
  const { t } = useTranslation()

  const { user } = useAuth()
  const { posts, isLoading } = usePostsAPI(user?.id ?? null, {
    // page: 1,
    // perPage: 10,
    postType: 'post',
    status: 'publish',
    // q: '',
    orderBy: 'views',
    // order: 'asc',
    order: 'desc',
    limit: 10,
  })

  // const { posts, isLoading } = usePostsAPI(user?.id ?? null, {
  //   // page: 1,
  //   // perPage: 10,
  //   postType: 'post',
  //   status: 'publish',
  //   // q: '',
  //   order: 'desc',
  //   limit: 10,
  // })

  if (isLoading) {
    return <Skeleton className="h-60 w-full" />
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{t('post_views_top_%d', { count: 10 })}</CardTitle>
        {/* <CardDescription></CardDescription> */}
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="w-[20px] text-left">#</th>
              <th className="text-left">{t('post')}</th>
              <th className="w-[60px] text-right">{t('views')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(posts) && posts?.length > 0 ? (
              posts?.map((post: Post) => (
                <ListItem key={post?.id} post={post} />
              ))
            ) : (
              <EmptyItem />
            )}
          </tbody>
        </table>
      </CardContent>
      {/* <CardFooter></CardFooter> */}
    </Card>
  )
}

interface ListItemProps extends React.HTMLAttributes<HTMLTableRowElement> {
  post: Post
}

const ListItem = ({ post, ...props }: ListItemProps) => {
  const views = getMeta(post?.meta, 'views', '0')

  return (
    <tr {...props}>
      <td>{post?.num}</td>
      <td>
        <Link
          href={`/dashboard/posts/edit?id=${post?.id}`}
          className="line-clamp-1 font-serif hover:underline"
        >
          {post?.title}
        </Link>
      </td>
      <td className="text-right">{views?.toLocaleString()}</td>
    </tr>
  )
}

const EmptyItem = () => {
  const { t } = useTranslation()

  return (
    <tr>
      <td colSpan={3}>{t('no_posts_yet')}</td>
    </tr>
  )
}

export { PostViews }
