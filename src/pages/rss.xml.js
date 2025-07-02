import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const articles = await getCollection('articles');
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
