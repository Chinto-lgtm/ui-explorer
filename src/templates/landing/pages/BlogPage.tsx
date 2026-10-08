import React, { useEffect, useMemo, useState } from 'react';
import { Search, BookOpen, Clock, SearchX } from 'lucide-react';
import { Breadcrumbs, Pagination } from '../../../components/ui/Navigation';
import { Input } from '../../../components/ui/Input';
import { Select, MultiSelect } from '../../../components/ui/Selection';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/DataDisplay';
import { Skeleton, EmptyState } from '../../../components/ui/Feedback';
import { Chip } from '../../../components/ui/Content';
import { useTemplateNav } from '../../nav';
import { Media } from '../../shared/Media';
import { PageHero } from '../blocks';
import { BLOG_CATEGORIES, BLOG_TAGS, POSTS } from '../../content';
import type { Post } from '../../content';

const PAGE_SIZE = 4;

const PostCard: React.FC<{ post: Post; index: number }> = ({ post, index }) => (
  <Card hoverable className="ls-post">
    <Media seed={index + 1} label={post.title} ratio="16 / 9" icon={<BookOpen size={20} />} />
    <div className="tpl-row tpl-row--wrap">
      <Badge size="sm" variant="accent">{post.category}</Badge>
      {post.tags.map((t) => <Badge key={t} size="sm" variant="outline">{t}</Badge>)}
    </div>
    <h3 className="ls-h3">{post.title}</h3>
    <p className="tpl-muted ls-post__excerpt">{post.excerpt}</p>
    <div className="tpl-row ls-post__meta">
      <Avatar name={post.author} size="sm" />
      <span className="tpl-grow">{post.author}</span>
      <span className="tpl-faint tpl-row"><Clock size={12} /> {post.minutes} min · {post.date}</span>
    </div>
  </Card>
);

const PostSkeleton: React.FC = () => (
  <Card className="ls-post" aria-hidden="true">
    <Skeleton height={0} className="ls-post__skeleton-media" />
    <Skeleton width="40%" height={18} />
    <Skeleton height={22} />
    <Skeleton height={14} />
    <Skeleton width="70%" height={14} />
    <div className="tpl-row"><Skeleton circle width={28} height={28} /><Skeleton width="50%" height={12} /></div>
  </Card>
);

export const BlogPage: React.FC = () => {
  const { go } = useTemplateNav();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  // Filtering pretends to fetch, so the loading state is part of the template.
  const filterKey = `${query}|${category}|${tags.join(',')}|${page}`;
  const [shownKey, setShownKey] = useState(filterKey);
  const loading = filterKey !== shownKey;
  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setShownKey(filterKey), 550);
    return () => window.clearTimeout(id);
  }, [filterKey, loading]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((p) =>
      (category === 'All' || p.category === category) &&
      (tags.length === 0 || tags.some((t) => p.tags.includes(t))) &&
      (!q || `${p.title} ${p.excerpt} ${p.author}`.toLowerCase().includes(q)));
  }, [query, category, tags]);

  const [featured, ...rest] = matches;
  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = rest.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const filtered = query !== '' || category !== 'All' || tags.length > 0;
  const reset = () => { setQuery(''); setCategory('All'); setTags([]); setPage(1); };

  return (
    <>
      <PageHero eyebrow="Blog" title="Notes on money, design and building Orbit" lead="Practical guides, product stories and the occasional deep dive from our engineers.">
        <Breadcrumbs items={[{ label: 'Home', onClick: () => go('home') }, { label: 'Resources' }, { label: 'Blog' }]} />
      </PageHero>

      <section className="ls-section ls-section--tight">
        <div className="ls-container tpl-stack">
          <div className="ls-filters">
            <Input aria-label="Search articles" placeholder="Search articles…" icon={<Search size={16} />} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
            <Select label="Category" value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={BLOG_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <MultiSelect label="Topics" placeholder="Any topic" value={tags} onChange={(v) => { setTags(v); setPage(1); }} options={BLOG_TAGS.map((t) => ({ value: t, label: t }))} />
          </div>
          {filtered && (
            <div className="tpl-row tpl-row--wrap">
              <span className="tpl-faint">{matches.length} result{matches.length === 1 ? '' : 's'} for</span>
              {query && <Chip size="sm" onRemove={() => setQuery('')}>“{query}”</Chip>}
              {category !== 'All' && <Chip size="sm" onRemove={() => setCategory('All')}>{category}</Chip>}
              {tags.map((t) => <Chip key={t} size="sm" onRemove={() => setTags(tags.filter((x) => x !== t))}>{t}</Chip>)}
              <Button size="sm" variant="ghost" onClick={reset}>Clear all</Button>
            </div>
          )}

          {loading ? (
            <div className="ls-grid ls-grid--2">{Array.from({ length: 4 }, (_, i) => <PostSkeleton key={i} />)}</div>
          ) : matches.length === 0 ? (
            <Card variant="flat">
              <EmptyState icon={<SearchX size={28} />} title="No articles match" description="Try another word, or clear the filters to see everything." action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} />
            </Card>
          ) : (
            <>
              {safePage === 1 && featured && (
                <Card hoverable className="ls-post ls-post--featured">
                  <Media seed={9} label={featured.title} icon={<BookOpen size={22} />} className="ls-post__hero" />
                  <div className="tpl-stack">
                    <Badge variant="accent" size="sm">Featured · {featured.category}</Badge>
                    <h2 className="ls-h2">{featured.title}</h2>
                    <p className="ls-lead">{featured.excerpt}</p>
                    <div className="tpl-row"><Avatar name={featured.author} size="md" /><span><strong>{featured.author}</strong><br /><span className="tpl-faint">{featured.date} · {featured.minutes} min read</span></span></div>
                  </div>
                </Card>
              )}
              <div className="ls-grid ls-grid--2">
                {visible.map((p, i) => <PostCard key={p.id} post={p} index={i + (safePage - 1) * PAGE_SIZE} />)}
              </div>
              {pageCount > 1 && <div className="ls-center"><Pagination page={safePage} pageCount={pageCount} onChange={setPage} /></div>}
            </>
          )}
        </div>
      </section>
    </>
  );
};
