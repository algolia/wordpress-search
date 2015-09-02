# Wordpress Plugins Search

This is the repository backing the [wordpress.algolia.com](https://wordpress.algolia.com/) website. It's an [Angular.js](https://angularjs.org/) app using the [AlgoliaSearch API client](http://github.com/algolia/algoliasearch-client-js) to power the search feature.

The search results are refreshed as you type, querying the Algolia API at each keystroke.

## Indexing

The Wordpress Plugins are crawled with a simple [Ruby+Shell script](https://github.com/algolia/wordpress-search/blob/master/import/run) and are formatted as follow in Algolia:

```js
{
  "objectID": "540765600",
  "name": "Akismet",
  "slug": "akismet",
  "version": "3.1.3",
  "popular": true,
  "author": "Automattic",
  "author_profile": "//profiles.wordpress.org/matt",
  "contributors": {
    "matt": "//profiles.wordpress.org/matt",
    "ryan": "//profiles.wordpress.org/ryan",
    // [...]
  },
  "requires": "3.2",
  "tested": "4.2.4",
  "rating": 5,
  "num_ratings": "377",
  "ratings": { "1": "14", "2": "3", "3": "5", "4": "12", "5": "343" },
  "downloaded": 34362207,
  "last_updated": "2015-07-06 11:44pm GMT",
  "added": "2005-10-20",
  "homepage": "http://akismet.com/",
  "short_description": "Akismet checks your comments against the Akismet Web service to see if they look like spam or not.",
  "download_link": "https://downloads.wordpress.org/plugin/akismet.3.1.3.zip",
  "tags": [ "Akismet", "anti-spam", "antispam", "comment moderation", "comment spam", "comments", "contact form spam", "spam", "spam comments" ],
  "donate_link": ""
}
```

The Algolia index is configured with the following settings:

```js
{
  "attributesToIndex": ['unordered(name)', 'unordered(tags)', 'author', 'unordered(short_description)'],
  "customRanking": ['desc(downloaded)'],
  "attributesForFaceting": ['author', 'tags', 'rating'],
  "ranking": ['desc(popular)', 'typo', 'words', 'proximity', 'attribute', 'exact', 'custom']
}
```

## Search

We're using the [Algoliasearch Helper](https://github.com/algolia/algoliasearch-helper-js) to perform the search queries while maintaining the refinements state, configured as follow:

```js
algoliasearchHelper($scope.client, 'wordpress_plugins', {
  facets: ['tags', 'author'],
  disjunctiveFacets: ['rating'],
  attributesToRetrieve: ['name', 'slug', 'rating', 'num_ratings', 'downloaded', 'last_updated', 'ratings', 'author_profile'],
  attributesToHighlight: ['name', 'short_description', 'author', 'tags'],
  maxValuesPerFacet: 10
});
```

## Development

### Environment

To start developing, you can use the following commands:

    $ [npm install -g gulp]
    $ npm install
    $ gulp

### Deployment

To deploy to the GitHub `gh-pages` branch, use the following commands:

    $ gulp deploy
    $ open https://wordpress.algolia.com
