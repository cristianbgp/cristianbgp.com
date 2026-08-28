import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getPublishedArticles } from '../lib/articles';

export async function GET(context) {
	const articles = getPublishedArticles(await getCollection('articles'))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: articles.map((article) => ({
			...article.data,
			link: `/articles/${article.id}/`,
		})),
	});
}
